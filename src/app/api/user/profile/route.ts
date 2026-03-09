import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Payment } from '@/models/Payment';
import { profileCache } from '@/lib/cache';

/**
 * POST /api/user/profile
 * Get user profile by email with Redis caching (for stored session fallback)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check stored session for authorization
    const storedSession = request.headers.get('x-nitminer-session');
    if (!storedSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const sessionData = JSON.parse(storedSession);
      if (sessionData.user?.email !== email) {
        return NextResponse.json({ error: 'Session email mismatch' }, { status: 401 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Try to get from cache first (30 minute TTL)
    const cacheKey = `profile:${email.toLowerCase()}`;
    let cachedProfile = await profileCache.get(cacheKey);

    if (cachedProfile) {
      console.log(`✅ Profile cache hit for ${email}`);
      return NextResponse.json({
        user: cachedProfile,
        fromCache: true,
      });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() }).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if subscription has expired
    if (user.isPremium && user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
      await User.findByIdAndUpdate(user._id, { isPremium: false });
      user.isPremium = false;
    }

    // Get latest payment
    const latestPayment = await Payment.findOne({ userId: user._id, status: 'success' })
      .sort({ createdAt: -1 })
      .lean();

    const profileData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
      trialCount: user.trialCount,
      subscriptionExpiry: user.subscriptionExpiry,
      lastPayment: latestPayment ? latestPayment.createdAt : null,
    };

    // Cache the profile for 30 minutes
    await profileCache.set(cacheKey, profileData, 1800);

    console.log(`📝 Profile fetched and cached for ${email}`);

    return NextResponse.json({
      user: profileData,
      fromCache: false,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
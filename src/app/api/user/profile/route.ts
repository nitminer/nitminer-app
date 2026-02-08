import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Payment } from '@/models/Payment';

/**
 * POST /api/user/profile
 * Get user profile by email (for stored session fallback)
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

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        trialCount: user.trialCount,
        subscriptionExpiry: user.subscriptionExpiry,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Payment } from '@/models/Payment';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    // Extract JWT token from cookies
    const accessToken = req.cookies.get('accessToken')?.value;

    if (!accessToken) {
      console.log('No access token found in cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(accessToken, secret) as any;
    } catch (error) {
      console.log('Token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (decoded.type !== 'access') {
      console.log('Invalid token type:', decoded.type);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.userId;
    const userEmail = decoded.email;

    console.log('GET /api/user/me - Session:', {
      hasSession: true,
      userId,
      userEmail,
    });

    if (!userId) {
      console.log('No userId found in token - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Validate if the ID is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const user = await User.findById(userId).lean();

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
      latestPayment,
    });
  } catch (error) {
    console.error('User profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export async function PATCH(req: NextRequest) {
  try {
    // Extract JWT token from cookies
    const accessToken = req.cookies.get('accessToken')?.value;

    if (!accessToken) {
      console.log('No access token found in cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(accessToken, secret) as any;
    } catch (error) {
      console.log('Token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (decoded.type !== 'access') {
      console.log('Invalid token type:', decoded.type);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.userId;
    const userEmail = decoded.email;

    console.log('PATCH /api/user/me - Session:', {
      hasSession: true,
      userId,
      userEmail,
    });

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Validate if the ID is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const body = await req.json();
    const { trialCount } = body;

    // Only allow updating trialCount
    if (trialCount !== undefined && typeof trialCount !== 'number') {
      return NextResponse.json({ error: 'Invalid trialCount' }, { status: 400 });
    }

    const updateData: any = {};
    if (trialCount !== undefined) {
      updateData.trialCount = Math.max(0, trialCount); // Ensure it doesn't go below 0
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
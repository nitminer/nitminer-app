import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Payment } from '@/models/Payment';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Validate if the ID is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const user = await User.findById(session.user.id).lean();

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Validate if the ID is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(session.user.id)) {
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
      session.user.id,
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
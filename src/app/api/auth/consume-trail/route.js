import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, email } = body || {};

    if (!userId && !email) {
      return NextResponse.json({ message: 'User ID or email is required' }, { status: 400 });
    }

    let user = null;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: String(email).toLowerCase() });
    }

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.isPremium) {
      return NextResponse.json({
        message: 'Premium user - no trials consumed',
        trialConsumed: false,
        trialCount: user.trialCount,
        isPremium: true,
      });
    }

    if ((user.trialCount || 0) <= 0) {
      return NextResponse.json(
        {
          message: 'No trials remaining. Please subscribe to continue.',
          trialConsumed: false,
          trialCount: 0,
          trialExhausted: true,
        },
        { status: 403 }
      );
    }

    user.trialCount = Math.max(0, (user.trialCount || 0) - 1);
    await user.save();

    return NextResponse.json({
      message: 'Trial consumed successfully',
      trialConsumed: true,
      trialCount: user.trialCount,
      trialExhausted: user.trialCount === 0,
      noOfTrails: user.trialCount,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        trialCount: user.trialCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Server error during trial consumption',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

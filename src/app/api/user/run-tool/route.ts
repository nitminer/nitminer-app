import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { UsageLog } from '@/models/UsageLog';
import { SystemSettings } from '@/models/SystemSettings';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get system settings
    const settings = await SystemSettings.findOne().lean();
    const freeTrialsEnabled = settings?.freeTrialsEnabled ?? true;

    // Check if user can run tool
    const currentDate = new Date();
    const isPremiumActive = user.isPremium && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > currentDate;

    if (!isPremiumActive && (!freeTrialsEnabled || user.trialCount <= 0)) {
      return NextResponse.json(
        {
          error: 'No trials left and subscription inactive',
          message: 'Your free trials have ended. Please subscribe.',
        },
        { status: 403 }
      );
    }

    // Decrement trial count if not premium
    if (!isPremiumActive) {
      user.trialCount -= 1;
      await user.save();
    }

    const { toolName, input, output, executionTime } = await req.json();

    // Log usage
    await UsageLog.create({
      userId: user._id,
      toolName,
      input,
      output,
      executionTime,
    });

    return NextResponse.json({
      success: true,
      trialsRemaining: user.trialCount,
      isPremium: isPremiumActive,
    });
  } catch (error) {
    console.error('Tool execution error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

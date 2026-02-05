import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has active premium subscription
    const hasPremium = user.isPremium ||
      (user.subscription?.status === 'active' &&
       user.subscription.endDate > new Date());

    // Check if trial is exceeded
    const trialExceeded = user.trialCount <= 0;

    // Get current plan name
    let currentPlan: string | undefined;
    if (hasPremium) {
      if (user.subscription?.plan) {
        currentPlan = user.subscription.plan === '1_month' ? '1 Month' :
                     user.subscription.plan === '6_months' ? '6 Months' : '12 Months';
      } else if (user.isPremium) {
        currentPlan = 'Premium';
      }
    }

    return NextResponse.json({
      hasPremium,
      trialExceeded,
      currentPlan,
    });
  } catch (error) {
    console.error('Verify status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
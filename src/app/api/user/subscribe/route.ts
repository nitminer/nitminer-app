import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json(); // '6_months' or '12_months'

    if (!['6_months', '12_months'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate subscription expiry
    const currentDate = new Date();
    const expiryDate = new Date(currentDate);

    if (plan === '6_months') {
      expiryDate.setMonth(expiryDate.getMonth() + 6);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    // Update user
    user.isPremium = true;
    user.subscriptionExpiry = expiryDate;
    user.trialCount = 0; // Reset trials when subscribing
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully',
      subscriptionExpiry: expiryDate,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

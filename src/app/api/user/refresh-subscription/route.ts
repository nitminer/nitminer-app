import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { Payment } from '@/models/Payment';
import { User } from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

/**
 * User endpoint to refresh their subscription status
 * Checks for the latest successful payment and updates subscription if needed
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const userId = session.user.id;

    await dbConnect();

    console.log(`[Refresh Subscription] Checking subscription for: ${userEmail}`);

    // Get the latest successful payment for this user
    const latestPayment = await Payment.findOne({ 
      userEmail: userEmail, 
      status: 'success' 
    }).sort({ createdAt: -1 });

    let wasUpdated = false;
    let message = 'No pending updates';

    if (latestPayment) {
      // Find user
      const user = await User.findById(userId);

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Check if subscription needs updating
      if (!user.isPremium || user.subscription?.paymentId?.toString() !== latestPayment._id.toString()) {
        // Calculate subscription end date
        const now = new Date();
        const endDate = new Date(now);

        if (latestPayment.planDuration === '1_month') {
          endDate.setMonth(now.getMonth() + 1);
        } else if (latestPayment.planDuration === '6_months') {
          endDate.setMonth(now.getMonth() + 6);
        } else {
          endDate.setFullYear(now.getFullYear() + 1);
        }

        // Update user subscription
        user.isPremium = true;
        user.subscriptionExpiry = endDate;
        user.subscription = {
          plan: latestPayment.planDuration,
          status: 'active',
          startDate: now,
          endDate: endDate,
          paymentId: latestPayment._id,
        };

        await user.save();
        wasUpdated = true;
        message = `Subscription updated to ${latestPayment.planName} - ${latestPayment.planDuration.replace(/_/g, ' ')}`;

        console.log(`[Refresh Subscription] Updated subscription for: ${userEmail}`, {
          plan: latestPayment.planDuration,
          endDate: endDate.toISOString(),
        });
      } else {
        message = 'Subscription already up to date';
      }
    } else {
      message = 'No successful payments found';
    }

    return NextResponse.json({
      success: true,
      message,
      wasUpdated,
      payment: latestPayment ? {
        id: latestPayment._id,
        planName: latestPayment.planName,
        planDuration: latestPayment.planDuration,
        amount: latestPayment.amount,
        completedAt: latestPayment.completedAt,
      } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Refresh Subscription] Error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh subscription', details: String(error) },
      { status: 500 }
    );
  }
}

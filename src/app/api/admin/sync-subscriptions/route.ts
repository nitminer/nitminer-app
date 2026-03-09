import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { Payment } from '@/models/Payment';
import { User } from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin endpoint to sync subscriptions from successful payments
 * This re-processes all successful payments and updates user subscription status
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    await dbConnect();

    console.log('[Sync Subscriptions] Starting sync...');

    // Get all successful payments
    const successfulPayments = await Payment.find({ status: 'success' });

    console.log(`[Sync Subscriptions] Found ${successfulPayments.length} successful payments`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const payment of successfulPayments) {
      try {
        // Find user by email
        const user = await User.findOne({ email: payment.userEmail });

        if (!user) {
          console.log(`[Sync Subscriptions] User not found for email: ${payment.userEmail}`);
          errorCount++;
          continue;
        }

        // Calculate subscription end date
        const now = new Date();
        const endDate = new Date(now);
        
        if (payment.planDuration === '1_month') {
          endDate.setMonth(now.getMonth() + 1);
        } else if (payment.planDuration === '6_months') {
          endDate.setMonth(now.getMonth() + 6);
        } else {
          endDate.setFullYear(now.getFullYear() + 1);
        }

        // Check if subscription is not already updated for this payment
        if (!user.isPremium || user.subscription?.paymentId?.toString() !== payment._id.toString()) {
          user.isPremium = true;
          user.subscriptionExpiry = endDate;
          user.subscription = {
            plan: payment.planDuration,
            status: 'active',
            startDate: payment.createdAt,
            endDate: endDate,
            paymentId: payment._id,
          };

          await user.save();
          updatedCount++;

          console.log(`[Sync Subscriptions] Updated subscription for: ${payment.userEmail}`, {
            plan: payment.planDuration,
            endDate: endDate.toISOString(),
          });
        } else {
          console.log(`[Sync Subscriptions] Subscription already up to date for: ${payment.userEmail}`);
        }
      } catch (error) {
        console.error(`[Sync Subscriptions] Error processing payment ${payment._id}:`, error);
        errorCount++;
      }
    }

    const response = {
      message: 'Subscription sync completed',
      total: successfulPayments.length,
      updated: updatedCount,
      errors: errorCount,
      timestamp: new Date().toISOString(),
    };

    console.log('[Sync Subscriptions] Sync completed:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Sync Subscriptions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscriptions', details: String(error) },
      { status: 500 }
    );
  }
}

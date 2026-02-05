import cron from 'node-cron';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { sendSubscriptionExpiredEmail } from '@/lib/email';

export function startSubscriptionCheckCron() {
  // Run every day at 12:00 AM (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running subscription expiry check...');

    try {
      await dbConnect();

      // Find all users with expired subscriptions
      const expiredDate = new Date();
      const expiredUsers = await User.find({
        isPremium: true,
        subscriptionExpiry: { $lt: expiredDate },
      });

      console.log(`[CRON] Found ${expiredUsers.length} users with expired subscriptions`);

      for (const user of expiredUsers) {
        // Update user
        await User.findByIdAndUpdate(user._id, {
          isPremium: false,
        });

        // Send email notification
        try {
          await sendSubscriptionExpiredEmail(user.email, user.name);
          console.log(`[CRON] Email sent to ${user.email}`);
        } catch (emailError) {
          console.error(`[CRON] Failed to send email to ${user.email}:`, emailError);
        }
      }

      console.log('[CRON] Subscription expiry check completed');
    } catch (error) {
      console.error('[CRON] Error in subscription check:', error);
    }
  });

  console.log('[CRON] Subscription expiry check scheduled for daily at 12:00 AM');
}

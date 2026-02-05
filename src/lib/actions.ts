'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Payment } from '@/models/Payment';

/**
 * Server action to check if user can access tool
 * Returns trial status and whether access is allowed
 */
export async function checkToolAccess() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        allowed: false,
        reason: 'not_authenticated',
        message: 'Please login to use tools',
      };
    }

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
      return {
        allowed: false,
        reason: 'user_not_found',
        message: 'User not found',
      };
    }

    // Check if premium is still active
    const currentDate = new Date();
    const isPremiumActive =
      user.isPremium && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > currentDate;

    // If not premium, check trials
    if (!isPremiumActive) {
      if (user.trialCount <= 0) {
        return {
          allowed: false,
          reason: 'no_trials',
          message: 'You have no trials left. Please subscribe.',
          trialsRemaining: 0,
          isPremium: false,
        };
      }

      return {
        allowed: true,
        reason: 'using_trial',
        message: `You have ${user.trialCount} trials remaining`,
        trialsRemaining: user.trialCount,
        isPremium: false,
      };
    }

    return {
      allowed: true,
      reason: 'premium_active',
      message: 'Full access with premium subscription',
      trialsRemaining: 0,
      isPremium: true,
      subscriptionExpiry: user.subscriptionExpiry,
    };
  } catch (error) {
    console.error('Error checking tool access:', error);
    return {
      allowed: false,
      reason: 'error',
      message: 'An error occurred',
    };
  }
}

/**
 * Server action to get user subscription status
 */
export async function getSubscriptionStatus() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return null;
    }

    await dbConnect();

    const user = await User.findById(session.user.id).select(
      'isPremium subscriptionExpiry trialCount'
    );

    if (!user) {
      return null;
    }

    // Check if subscription expired
    if (user.isPremium && new Date(user.subscriptionExpiry!) < new Date()) {
      await User.findByIdAndUpdate(user._id, { isPremium: false });
      return {
        isPremium: false,
        trialCount: user.trialCount,
        subscriptionExpiry: null,
      };
    }

    return {
      isPremium: user.isPremium,
      trialCount: user.trialCount,
      subscriptionExpiry: user.subscriptionExpiry,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return null;
  }
}

/**
 * Server action to get user's latest payment
 */
export async function getLatestPayment() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return null;
    }

    await dbConnect();

    const payment = await Payment.findOne({
      userId: session.user.id,
      status: 'success',
    })
      .sort({ createdAt: -1 })
      .lean();

    return payment;
  } catch (error) {
    console.error('Error getting latest payment:', error);
    return null;
  }
}

/**
 * Server action to check if user is admin
 */
export async function isAdmin() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return false;
    }

    await dbConnect();

    const user = await User.findById(session.user.id).select('role');

    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

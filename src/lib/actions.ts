'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Payment } from '@/models/Payment';

/**
 * Helper function to get user ID from JWT token in cookies
 */
async function getUserIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return null;
    }

    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return null;
    }

    try {
      const decoded = jwt.verify(accessToken, secret) as any;
      if (decoded.type === 'access' && decoded.userId) {
        return decoded.userId;
      }
    } catch (error) {
      console.warn('Token verification failed:', error);
      return null;
    }
  } catch (error) {
    console.warn('Error reading cookies:', error);
    return null;
  }

  return null;
}

/**
 * Server action to check if user can access tool
 * Returns trial status and whether access is allowed
 */
export async function checkToolAccess() {
  try {
    const userId = await getUserIdFromCookies();

    if (!userId) {
      return {
        allowed: false,
        reason: 'not_authenticated',
        message: 'Please login to use tools',
      };
    }

    await dbConnect();

    const user = await User.findById(userId);

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
    const userId = await getUserIdFromCookies();

    if (!userId) {
      return null;
    }

    await dbConnect();

    const user = await User.findById(userId).select(
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
    const userId = await getUserIdFromCookies();

    if (!userId) {
      return null;
    }

    await dbConnect();

    const payment = await Payment.findOne({
      userId: userId,
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
    const userId = await getUserIdFromCookies();

    if (!userId) {
      return false;
    }

    await dbConnect();

    const user = await User.findById(userId).select('role');

    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

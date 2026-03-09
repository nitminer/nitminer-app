import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Payment } from '@/models/Payment';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    console.log('[API /user/me] GET request received');
    
    // Use getServerSession - the official NextAuth method
    const session = await getServerSession(authOptions);

    console.log('[API /user/me] Session result:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    if (!session?.user?.id) {
      console.log('[API /user/me] No valid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    await dbConnect();

    // Validate if the ID is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if subscription has expired
    if (user.isPremium && user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
      console.log('[API /user/me] Subscription expired, updating user isPremium to false');
      await User.findByIdAndUpdate(user._id, { isPremium: false, subscription: null });
      user.isPremium = false;
    }
    
    // If user is marked as premium but has no subscriptionExpiry, try to get it from subscription object
    if (user.isPremium && !user.subscriptionExpiry && user.subscription?.endDate) {
      console.log('[API /user/me] Syncing subscriptionExpiry from subscription object');
      user.subscriptionExpiry = user.subscription.endDate;
    }

    // CRITICAL: Check if subscription object shows active status even if isPremium is false
    // This handles the case where payment was successful but isPremium field wasn't updated
    if (!user.isPremium && user.subscription?.status === 'active') {
      const endDate = user.subscription.endDate ? new Date(user.subscription.endDate) : null;
      const now = new Date();
      
      if (endDate && endDate > now) {
        console.log('[API /user/me] Found active subscription despite isPremium=false, syncing...');
        
        // Update user to sync isPremium flag
        await User.findByIdAndUpdate(user._id, {
          isPremium: true,
          subscriptionExpiry: endDate,
        });
        
        user.isPremium = true;
        user.subscriptionExpiry = endDate;
      }
    }

    // Validate subscription against Payment record
    if (user.subscription?.status === 'active' && user.subscription?._id) {
      const paymentRecord = await Payment.findOne({
        _id: user.subscription._id,
        status: 'success',
      }).lean();

      if (!paymentRecord) {
        console.warn('[API /user/me] WARNING: subscription references payment that has no success record');
      }
    }

    // Get latest payment
    const latestPayment = await Payment.findOne({ userId: user._id, status: 'success' })
      .sort({ createdAt: -1 })
      .lean();

    console.log('[API /user/me] Returning user data:', {
      email: user.email,
      isPremium: user.isPremium,
      subscriptionExpiry: user.subscriptionExpiry,
      subscriptionStatus: user.subscription?.status,
    });
    
    return NextResponse.json({
      user: {
        id: user._id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'User',
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        trialCount: user.trialCount,
        subscriptionExpiry: user.subscriptionExpiry,
        subscription: user.subscription,
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
    // Use getServerSession - the official NextAuth method
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('[API /user/me PATCH] No valid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    console.log('[API /user/me PATCH] Session:', {
      hasSession: true,
      userId,
      userEmail,
    });

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Validate if the ID is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(userId)) {
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
      userId,
      updateData,
      { new: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'User',
        firstName: user.firstName,
        lastName: user.lastName,
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('[API /user/me POST] No valid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    console.log('[API /user/me POST] Sync subscription request', { userId, userEmail });

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find latest successful payment for this user
    const latestPayment = await Payment.findOne({
      userId: user._id,
      status: 'success',
    }).sort({ createdAt: -1 });

    if (!latestPayment) {
      return NextResponse.json({
        message: 'No successful payment found',
        user: {
          id: user._id,
          email: user.email,
          isPremium: user.isPremium,
          subscription: user.subscription,
        },
      }, { status: 200 });
    }

    console.log('[API /user/me POST] Found payment:', {
      paymentId: latestPayment._id,
      planName: latestPayment.planName,
      planDuration: latestPayment.planDuration,
      status: latestPayment.status,
    });

    // Calculate subscription end date based on plan duration
    const completedAt = new Date(latestPayment.completedAt || latestPayment.createdAt);
    let endDate = new Date(completedAt);

    if (latestPayment.planDuration === '1_month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (latestPayment.planDuration === '3_months') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (latestPayment.planDuration === '6_months') {
      endDate.setMonth(endDate.getMonth() + 6);
    } else if (latestPayment.planDuration === '1_year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Update user with subscription info
    const updateData = {
      isPremium: true,
      subscriptionExpiry: endDate,
      subscription: {
        _id: latestPayment._id,
        plan: latestPayment.planDuration,
        planName: latestPayment.planName,
        status: 'active',
        startDate: completedAt,
        endDate: endDate,
      },
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    console.log('[API /user/me POST] User subscription synced', {
      email: updatedUser.email,
      isPremium: updatedUser.isPremium,
      subscriptionExpiry: updatedUser.subscriptionExpiry,
    });

    return NextResponse.json({
      message: 'Subscription synced successfully',
      user: {
        id: updatedUser._id,
        name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim() || updatedUser.email?.split('@')[0] || 'User',
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        isPremium: updatedUser.isPremium,
        trialCount: updatedUser.trialCount,
        subscriptionExpiry: updatedUser.subscriptionExpiry,
        subscription: updatedUser.subscription,
      },
      latestPayment: {
        id: latestPayment._id,
        planName: latestPayment.planName,
        planDuration: latestPayment.planDuration,
        amount: latestPayment.amount,
        completedAt: latestPayment.completedAt,
      },
    });
  } catch (error) {
    console.error('Subscription sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
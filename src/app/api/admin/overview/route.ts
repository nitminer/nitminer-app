import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Payment } from '@/models/Payment';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get user stats
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const freeTrialUsers = totalUsers - premiumUsers;

    // Get payment stats - use 'success' status instead of 'completed'
    const successfulPayments = await Payment.find({ status: 'success' }).lean();

    const totalRevenue = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyPayments = await Payment.find({
      status: 'success',
      createdAt: { $gte: thirtyDaysAgo }
    }).lean();

    const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Revenue by plan
    const revenueByPlan = await Payment.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: '$planName',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    console.log('✅ Admin overview fetched:', {
      totalUsers,
      premiumUsers,
      freeTrialUsers,
      totalRevenue,
      monthlyRevenue,
      revenueByPlan: revenueByPlan.length
    });

    return NextResponse.json({
      totalUsers,
      premiumUsers,
      freeTrialUsers,
      totalRevenue,
      monthlyRevenue,
      revenueByPlan
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

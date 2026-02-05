import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Payment } from '@/models/Payment';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get user stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get payment stats
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.find({ status: 'completed' });

    const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentPayments = await Payment.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      status: 'completed'
    });

    // Get subscription distribution
    const subscriptionStats = await User.aggregate([
      { $group: { _id: '$subscription', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalPayments,
      totalRevenue,
      recentActivity: {
        newUsers: recentUsers,
        newPayments: recentPayments,
      },
      subscriptionStats
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

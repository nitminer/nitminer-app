import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { Payment } from '@/models/Payment';
import { User } from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      // Find users matching the search
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ]
      }).select('_id');

      query.userId = { $in: users.map(u => u._id) };
    }

    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Payment.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Calculate total revenue and successful payments count
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const successfulPaymentsCount = revenueResult.length > 0 ? revenueResult[0].count : 0;

    return NextResponse.json({
      payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalPayments: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      totalRevenue,
      successfulPaymentsCount
    });
  } catch (error) {
    console.error('Admin payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

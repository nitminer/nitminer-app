import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { UsageLog } from '@/models/UsageLog';
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');
    const skip = (page - 1) * limit;

    const query: any = {};
    if (userId) query.userId = userId;

    const logs = await UsageLog.find(query)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UsageLog.countDocuments(query);

    // Group by tool
    const toolUsage = await UsageLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$toolName',
          count: { $sum: 1 },
          avgExecutionTime: { $avg: '$executionTime' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      logs,
      toolUsage,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

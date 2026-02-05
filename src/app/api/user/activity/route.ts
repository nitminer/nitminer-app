import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { UsageLog } from '@/models/UsageLog';
import { Payment } from '@/models/Payment';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Fetch recent logs and payments
    const [logs, payments] = await Promise.all([
      UsageLog.find({ userId: session.user.id })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean(),
      Payment.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    ]);

    // Combine and format activities
    const activities = [
      ...logs.map(log => ({
        id: log._id.toString(),
        type: 'tool_execution' as const,
        title: 'Tool Execution',
        description: `Executed ${log.toolName}`,
        timestamp: log.timestamp,
        status: 'success' as const
      })),
      ...payments.map(payment => ({
        id: payment._id.toString(),
        type: 'payment' as const,
        title: 'Payment Processed',
        description: `Paid ₹${payment.amount} for ${payment.plan}`,
        timestamp: payment.createdAt,
        status: payment.status === 'success' ? 'success' as const : 'error' as const
      }))
    ];

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Return only the most recent activities
    const recentActivities = activities.slice(0, limit);

    return NextResponse.json({
      activities: recentActivities
    });
  } catch (error) {
    console.error('User activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
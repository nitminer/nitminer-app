import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { UsageLog } from '@/models/UsageLog';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    let session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    // If no NextAuth session, check for stored session
    if (!userId) {
      const storedSession = req.headers.get('x-nitminer-session');

      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          if (sessionData.user?.email) {
            // Find user by email from stored session
            await dbConnect();
            const { User } = await import('@/models/User');
            const user = await User.findOne({ email: sessionData.user.email }).lean();
            if (user) {
              userId = user._id.toString();
            }
          }
        } catch (error) {
          console.warn('Error parsing stored session:', error);
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const logs = await UsageLog.find({ userId: userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UsageLog.countDocuments({ userId: userId });

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('User logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

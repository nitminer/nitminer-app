import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { Payment } from '@/models/Payment';
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

    const payments = await Payment.find({ userId: userId, status: 'success' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Payment.countDocuments({ userId: userId, status: 'success' });

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Payment history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

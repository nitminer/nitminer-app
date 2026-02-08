import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { RefundRequest } from '@/models/RefundRequest';
import { Payment } from '@/models/Payment';

export async function GET(request: NextRequest) {
  try {
    // Get token from NextAuth
    const token = await getToken({ req: request });

    if (!token || !token.email) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    const userEmail = token.email;

    // Get user to find userId
    const { User } = await import('@/models/User');
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = user._id;

    // Get query parameters for filtering and pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    const pageSize = Math.min(limit, 50); // Max 50 per page
    const skip = (page - 1) * pageSize;

    // Build query - search by userId or userEmail (backward compatible)
    const query: any = {
      $or: [
        { userId: userId },
        { userEmail: userEmail }
      ]
    };
    if (status) {
      query.status = status;
    }

    console.log('🔍 Fetching refund requests for:', { userEmail, userId, query, page, limit: pageSize });

    // Fetch refund requests with pagination
    const refundRequests = await RefundRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate({
        path: 'paymentId',
        select: 'planName amount status completedAt',
      })
      .lean();

    console.log('✅ Refund requests found:', refundRequests.length);

    // Get total count for pagination
    const total = await RefundRequest.countDocuments(query);

    return NextResponse.json(
      {
        refundRequests,
        pagination: {
          page,
          pageSize,
          total,
          pages: Math.ceil(total / pageSize),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

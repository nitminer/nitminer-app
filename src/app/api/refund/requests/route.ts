import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/dbConnect';
import { RefundRequest } from '@/models/RefundRequest';
import { Payment } from '@/models/Payment';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function GET(request: NextRequest) {
  try {
    // Extract JWT token from cookies
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded: any;
    try {
      const secret = JWT_SECRET;
      const verified = await jwtVerify(token, secret);
      decoded = verified.payload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if token is access token
    if (decoded.type !== 'access') {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token type' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    const userId = decoded.userId;

    // Get query parameters for filtering and pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    const pageSize = Math.min(limit, 50); // Max 50 per page
    const skip = (page - 1) * pageSize;

    // Build query
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    // Fetch refund requests with pagination
    const refundRequests = await RefundRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate({
        path: 'paymentId',
        select: 'plan amount status completedAt',
      })
      .lean();

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

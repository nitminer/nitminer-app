import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import  { RefundRequest } from '@/models/RefundRequest';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token || !token.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'user';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await dbConnect();

    let query: any = {};

    // Filter by role
    if (token.role !== 'admin' && role === 'user') {
      query.userEmail = token.email;
    }

    const skip = (page - 1) * limit;

    const refundRequests = await RefundRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'paymentId',
        select: 'amount planName status'
      })
      .lean();

    // Ensure amount field exists for backward compatibility
    const enrichedRequests = refundRequests.map((request: any) => {
      const enriched = {
        ...request,
        amount: request.amount || (request.paymentId?.amount || 0)
      };
      console.log('📦 Refund request:', {
        _id: request._id.toString(),
        hasAmount: !!request.amount,
        hasPaymentId: !!request.paymentId,
        paymentAmount: request.paymentId?.amount,
        finalAmount: enriched.amount
      });
      return enriched;
    });

    const total = await RefundRequest.countDocuments(query);

    return NextResponse.json({
      data: enrichedRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Refund requests GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token || !token.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentId, amount, reason } = body;

    if (!paymentId || !amount || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    const refundRequest = new RefundRequest({
      userEmail: token.email,
      paymentId,
      amount,
      reason,
      status: 'pending',
    });

    await refundRequest.save();

    return NextResponse.json({
      message: 'Refund request created successfully',
      data: refundRequest,
    });
  } catch (error) {
    console.error('Refund request POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

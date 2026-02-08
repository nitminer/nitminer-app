import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/dbConnect';
import { RefundRequest } from '@/models/RefundRequest';
import { Payment } from '@/models/Payment';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { paymentId, reason } = body;

    // Validate input
    if (!paymentId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentId and reason' },
        { status: 400 }
      );
    }

    if (reason.length < 10 || reason.length > 1000) {
      return NextResponse.json(
        { error: 'Reason must be between 10 and 1000 characters' },
        { status: 400 }
      );
    }

    // Verify payment belongs to user and is successful
    const payment = await Payment.findOne({
      _id: paymentId,
      userId: userId,
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found or does not belong to you' },
        { status: 404 }
      );
    }

    if (payment.status !== 'success') {
      return NextResponse.json(
        { error: 'Cannot request refund for unsuccessful payment' },
        { status: 400 }
      );
    }

    // Check if refund request already exists for this payment
    const existingRequest = await RefundRequest.findOne({
      paymentId: paymentId,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A pending or approved refund request already exists for this payment' },
        { status: 400 }
      );
    }

    // Create refund request
    const refundRequest = new RefundRequest({
      userId,
      paymentId,
      reason,
    });

    await refundRequest.save();

    return NextResponse.json(
      {
        message: 'Refund request submitted successfully',
        refundRequest: refundRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating refund request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

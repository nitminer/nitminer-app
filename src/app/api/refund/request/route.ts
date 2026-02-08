import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { RefundRequest } from '@/models/RefundRequest';
import { Payment } from '@/models/Payment';

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { paymentId, reason } = body;

    // Get userId from email
    const { User } = await import('@/models/User');
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = user._id;

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
      userEmail: userEmail,
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
      userEmail,
      paymentId,
      amount: payment.amount,
      reason,
    });

    await refundRequest.save();

    console.log('✅ Refund request created:', {
      _id: refundRequest._id,
      userEmail: refundRequest.userEmail,
      paymentId: refundRequest.paymentId,
      amount: refundRequest.amount,
      status: refundRequest.status,
    });

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

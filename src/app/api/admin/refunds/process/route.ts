import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { RefundRequest } from '@/models/RefundRequest';
import { Payment } from '@/models/Payment';
import { User } from '@/models/User';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * POST /api/admin/refunds/process
 * Process a refund for a specific refund request using Razorpay
 * Body: { refundRequestId, refundPercentage, adminNotes }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();

    const { refundRequestId, refundPercentage, adminNotes } = await req.json();

    if (!refundRequestId || !refundPercentage) {
      return NextResponse.json(
        { error: 'Missing required fields: refundRequestId, refundPercentage' },
        { status: 400 }
      );
    }

    if (refundPercentage < 0 || refundPercentage > 100) {
      return NextResponse.json(
        { error: 'Refund percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Fetch refund request
    const refundRequest = await RefundRequest.findById(refundRequestId);

    if (!refundRequest) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      );
    }

    if (refundRequest.status !== 'pending' && refundRequest.status !== 'approved') {
      return NextResponse.json(
        { error: `Cannot process refund with status: ${refundRequest.status}` },
        { status: 400 }
      );
    }

    // Fetch payment details
    const payment = await Payment.findById(refundRequest.paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: 'Associated payment not found' },
        { status: 404 }
      );
    }

    console.log(`💳 Payment details:`, {
      paymentId: payment.paymentId,
      amount: payment.amount,
      status: payment.status,
      paymentMode: payment.paymentMode,
    });

    // Validate payment status - accept both 'success' and 'completed'
    if (payment.status !== 'success' && payment.status !== 'completed') {
      return NextResponse.json(
        { error: `Cannot refund payment with status: ${payment.status}. Payment must be successful.` },
        { status: 400 }
      );
    }

    // Calculate refund amount
    const originalAmount = payment.amount; // amount in paise
    const refundAmount = Math.round((originalAmount * refundPercentage) / 100);

    console.log(`🔄 Processing refund:`, {
      refundRequestId,
      paymentId: payment.paymentId,
      originalAmount: originalAmount / 100,
      refundPercentage,
      refundAmount: refundAmount / 100,
    });

    // Create refund via Razorpay
    let razorpayRefundId: string;
    try {
      const refundResponse = await razorpay.payments.refund(payment.paymentId, {
        amount: refundAmount,
        speed: 'optimum',
        notes: {
          refundRequestId: refundRequestId.toString(),
          reason: refundRequest.reason,
          percentage: refundPercentage,
        },
      });

      razorpayRefundId = refundResponse.id;
      console.log(`✅ Razorpay refund created:`, razorpayRefundId);
    } catch (razorpayError: any) {
      const errorMessage = razorpayError?.message || razorpayError?.error?.description || JSON.stringify(razorpayError);
      console.error('❌ Razorpay refund error:', errorMessage);
      console.error('❌ Full error object:', razorpayError);
      return NextResponse.json(
        {
          error: 'Failed to process refund through payment gateway',
          details: errorMessage,
        },
        { status: 400 }
      );
    }

    // Update refund request status
    refundRequest.status = 'completed';
    refundRequest.refundAmount = refundAmount;
    refundRequest.refundTransactionId = razorpayRefundId;
    refundRequest.adminNotes = adminNotes || '';
    await refundRequest.save();

    console.log(`✅ Refund request updated:`, {
      status: refundRequest.status,
      refundAmount: refundAmount / 100,
      transactionId: razorpayRefundId,
    });

    // Set user's isPremium to false after successful refund
    console.log(`👤 Updating user premium status for refund...`);
    const user = await User.findById(refundRequest.userId);
    if (user) {
      user.isPremium = false;
      user.subscription = null; // Clear subscription object
      user.subscriptionExpiry = null;
      await user.save();
      console.log(`✅ User premium status revoked:`, {
        userId: user._id,
        email: user.email,
        isPremium: user.isPremium,
        subscription: user.subscription,
      });
    } else {
      console.warn(`⚠️ User not found for refund request:`, refundRequest.userId);
    }

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        _id: refundRequest._id,
        status: refundRequest.status,
        refundAmount: refundAmount / 100,
        refundPercentage,
        refundTransactionId: razorpayRefundId,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('❌ Error processing refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}

import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { Payment } from '@/models/Payment';
import { User } from '@/models/User';
import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateHTMLPDFReceiptBuffer } from '@/lib/receiptGenerator';
import { uploadReceiptToCloudinary } from '@/lib/cloudinary';
import { sendPaymentSuccessEmail } from '@/lib/email';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    // Get token from NextAuth session
    const token = await getToken({ req });

    if (!token?.email) {
      console.log('Payment verify - No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = token.email;

    console.log('Payment verify - Session:', userEmail);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    console.log('Payment verify - Request data:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 });
    }

    await dbConnect();

    // Verify payment signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      console.error('❌ Signature verification failed');
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }

    // Verify payment with Razorpay API to ensure it was actually captured
    let paymentDetails: any;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      
      console.log('💳 Razorpay Payment Details:', {
        id: paymentDetails.id,
        status: paymentDetails.status,
        method: paymentDetails.method,
      });

      // Only accept payments with status 'captured'
      if (paymentDetails.status !== 'captured') {
        console.error(`❌ Payment status is ${paymentDetails.status}, not captured`);
        return NextResponse.json(
          { error: `Payment not completed. Status: ${paymentDetails.status}` },
          { status: 400 }
        );
      }

      // Verify order details match
      if (paymentDetails.order_id !== razorpay_order_id) {
        console.error('❌ Order ID mismatch');
        return NextResponse.json({ error: 'Order ID verification failed' }, { status: 400 });
      }
    } catch (razorpayError) {
      console.error('❌ Error verifying with Razorpay:', razorpayError);
      return NextResponse.json(
        { error: 'Failed to verify payment with Razorpay' },
        { status: 500 }
      );
    }

    // Find and update payment record
    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id, userEmail },
      {
        paymentId: razorpay_payment_id,
        status: 'success',
        completedAt: new Date(),
      },
      { new: true }
    );

    if (!payment) {
      console.error('❌ Payment record not found for order:', razorpay_order_id);
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    console.log('✅ Payment verified successfully');

    // Fetch user details for email and update premium status
    const user = await User.findOne({ email: userEmail });
    const userName = user?.name || userEmail.split('@')[0];

    // Calculate subscription end date
    const now = new Date();
    const endDate = new Date(now);
    if (payment.planDuration === '1_month') {
      endDate.setMonth(now.getMonth() + 1);
    } else if (payment.planDuration === '6_months') {
      endDate.setMonth(now.getMonth() + 6);
    } else {
      endDate.setFullYear(now.getFullYear() + 1);
    }

    // Update user premium status and subscription
    if (user) {
      user.isPremium = true;
      user.subscription = {
        plan: payment.planDuration, // Use planDuration (1_month, 6_months, 12_months) not planName
        status: 'active',
        startDate: now,
        endDate: endDate,
        paymentId: payment._id,
      };
      await user.save();
      console.log('✅ User premium status updated');
    }

    // Generate receipt and send email
    try {
      console.log('🧾 Generating payment receipt...');

      const receiptData = {
        receiptNumber: `TI-${Date.now()}-${payment._id.toString().slice(-6).toUpperCase()}`,
        receiptDate: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        receiptTime: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        customerName: userName,
        customerEmail: userEmail,
        customerId: payment._id.toString(),
        serviceDescription: `${payment.planName} - ${payment.planDuration.replace(/_/g, ' ').toUpperCase()} Premium Subscription`,
        amountInRupees: payment.amount, // Already in paise from frontend
        paymentMethod: paymentDetails.method || 'Online Payment',
        transactionId: razorpay_payment_id,
        serviceStartDate: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        serviceEndDate: new Date(Date.now() + (payment.planDuration === '1_month' ? 30 : payment.planDuration === '6_months' ? 180 : 365) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        paymentStatus: 'Success',
        duration: payment.planDuration === '1_month' ? 1 : payment.planDuration === '6_months' ? 6 : 12,
      };

      const pdfBuffer = await generateHTMLPDFReceiptBuffer(receiptData);
      const fileName = `receipt-${payment._id}-${Date.now()}.pdf`;
      const receiptUrl = await uploadReceiptToCloudinary(pdfBuffer, fileName);

      // Update payment with receipt URL
      await Payment.findByIdAndUpdate(payment._id, {
        invoiceUrl: receiptUrl,
      });

      // Send email with receipt
      await sendPaymentSuccessEmail(
        userEmail,
        userName,
        payment.amount / 100, // Convert paise to rupees for display
        `${payment.planName} - ${payment.planDuration.replace(/_/g, ' ').toUpperCase()}`,
        receiptUrl,
        receiptData.serviceEndDate,
        razorpay_payment_id,
        receiptData.paymentMethod
      );

      console.log('✅ Payment receipt generated and email sent to:', userEmail);
    } catch (emailError) {
      console.error('⚠️ Error sending payment email:', emailError);
      // Don't fail the payment verification if email fails
      // The payment is already verified and stored
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        planName: payment.planName,
        planDuration: payment.planDuration,
        status: 'success',
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Payment } from '@/models/Payment';
import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { generateHTMLPDFReceiptBuffer } from '@/lib/receiptGenerator';
import { uploadReceiptToCloudinary } from '@/lib/cloudinary';
import { sendPaymentSuccessEmail } from '@/lib/email';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    // Extract JWT token from cookies
    const accessToken = req.cookies.get('accessToken')?.value;

    if (!accessToken) {
      console.log('Payment verify - No access token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(accessToken, secret) as any;
    } catch (error) {
      console.log('Payment verify - Token verification failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (decoded.type !== 'access' || !decoded.email) {
      console.log('Payment verify - Invalid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = decoded.email;

    console.log('Payment verify - Session:', userEmail, 'ID:', decoded.userId);

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
    try {
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      
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
      { orderId: razorpay_order_id },
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

    // Update user subscription
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate subscription end date based on plan
    const now = new Date();
    let endDate = new Date(now);

    if (payment.plan === '1_month') {
      endDate.setMonth(now.getMonth() + 1);
    } else if (payment.plan === '6_months') {
      endDate.setMonth(now.getMonth() + 6);
    } else if (payment.plan === '12_months') {
      endDate.setFullYear(now.getFullYear() + 1);
    }

    user.isPremium = true;
    user.subscription = {
      plan: payment.plan,
      status: 'active',
      startDate: now,
      endDate: endDate,
      paymentId: payment._id,
    };

    await user.save();

    // Generate and send receipt
    try {
      console.log('🧾 Generating payment receipt...');

      // Map Razorpay payment method to readable format
      const paymentMethodMap: { [key: string]: string } = {
        'card': 'Credit/Debit Card',
        'upi': 'UPI',
        'netbanking': 'Net Banking',
        'wallet': 'Wallet',
        'emandate': 'E-Mandate',
        'paylater': 'Buy Now Pay Later',
      };

      // Determine payment method (fetch from Razorpay API if available)
      let paymentMethod = 'Online Payment';
      try {
        const fetchedPayment = await razorpay.payments.fetch(razorpay_payment_id);
        if (fetchedPayment.method) {
          paymentMethod = paymentMethodMap[fetchedPayment.method] || fetchedPayment.method;
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch payment details:', err);
      }

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
        customerName: user.name,
        customerEmail: user.email,
        customerId: user._id.toString(),
        serviceDescription: `${payment.plan.replace('_', ' ').toUpperCase()} Premium Subscription`,
        amountInRupees: payment.amount * 100, // Convert back to paise for display
        paymentMethod: paymentMethod,
        transactionId: razorpay_payment_id,
        serviceStartDate: user.subscription!.startDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        serviceEndDate: user.subscription!.endDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        paymentStatus: 'Success',
        duration: payment.plan === '1_month' ? 1 : payment.plan === '6_months' ? 6 : 12,
      };

      // Generate PDF receipt
      const pdfBuffer = await generateHTMLPDFReceiptBuffer(receiptData);

      // Upload to Cloudinary
      const fileName = `receipt-${payment._id}-${Date.now()}.pdf`;
      const receiptUrl = await uploadReceiptToCloudinary(pdfBuffer, fileName);

      // Update payment record with receipt URL
      await Payment.findByIdAndUpdate(payment._id, {
        invoiceUrl: receiptUrl,
      });

      // Send email with payment receipt
      await sendPaymentSuccessEmail(
        user.email,
        user.name,
        payment.amount,
        payment.plan.replace('_', ' ').toUpperCase(),
        receiptUrl,
        user.subscription!.endDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        razorpay_payment_id,
        paymentMethod
      );

      console.log('✅ Receipt generated and email sent');
    } catch (receiptError) {
      console.error('❌ Error generating/sending receipt:', receiptError);
      // Don't fail the payment verification if receipt generation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription: user.subscription,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
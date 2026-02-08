import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import { Payment } from '@/models/Payment';
import { User } from '@/models/User';
import { sendPaymentSuccessEmail } from '@/lib/email';
import { generateHTMLPDFReceiptBuffer } from '@/lib/receiptGenerator';
import { uploadReceiptToCloudinary } from '@/lib/cloudinary';

/**
 * POST /api/payments/webhook
 * Razorpay webhook handler for real-time payment updates
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('❌ Missing Razorpay signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('📨 Webhook received:', event.event);

    await dbConnect();

    // Handle different payment events
    switch (event.event) {
      case 'payment.authorized':
      case 'payment.captured':
        await handlePaymentSuccess(event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event);
        break;

      case 'order.paid':
        console.log('✅ Order marked as paid:', event.payload.order.entity.id);
        break;

      default:
        console.log('ℹ️ Unhandled event:', event.event);
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentSuccess(event: any) {
  try {
    const paymentEntity = event.payload.payment.entity;
    const orderId = paymentEntity.order_id;

    console.log('💳 Processing payment success:', {
      orderId,
      paymentId: paymentEntity.id,
      status: paymentEntity.status,
      method: paymentEntity.method,
    });

    // Find payment record
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      {
        paymentId: paymentEntity.id,
        status: 'success',
        completedAt: new Date(),
      },
      { new: true }
    );

    if (!payment) {
      console.error('❌ Payment record not found for order:', orderId);
      return;
    }

    // Find and update user subscription
    const user = await User.findOne({ email: payment.userEmail });
    if (!user) {
      console.error('❌ User not found:', payment.userEmail);
      return;
    }

    // Calculate subscription end date
    const now = new Date();
    let endDate = new Date(now);

    if (payment.planDuration === '1_month') {
      endDate.setMonth(now.getMonth() + 1);
    } else if (payment.planDuration === '6_months') {
      endDate.setMonth(now.getMonth() + 6);
    } else if (payment.planDuration === '12_months') {
      endDate.setFullYear(now.getFullYear() + 1);
    }

    user.isPremium = true;
    user.subscription = {
      plan: payment.planDuration, // Use planDuration (1_month, 6_months, 12_months) not planName
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

      const paymentMethod = paymentMethodMap[paymentEntity.method] || paymentEntity.method || 'Online Payment';

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
        serviceDescription: `${payment.planName} - ${payment.planDuration.replace(/_/g, ' ').toUpperCase()} Premium Subscription`,
        amountInRupees: payment.amount * 100,
        paymentMethod: paymentMethod,
        transactionId: paymentEntity.id,
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
        duration: payment.planDuration === '1_month' ? 1 : payment.planDuration === '6_months' ? 6 : 12,
      };

      console.log('✅ Receipt data prepared:', {
        receiptNumber: receiptData.receiptNumber,
        amount: receiptData.amountInRupees / 100,
        paymentMethod: receiptData.paymentMethod,
      });

      const pdfBuffer = await generateHTMLPDFReceiptBuffer(receiptData);
      const fileName = `receipt-${payment._id}-${Date.now()}.pdf`;
      const receiptUrl = await uploadReceiptToCloudinary(pdfBuffer, fileName);

      await Payment.findByIdAndUpdate(payment._id, {
        invoiceUrl: receiptUrl,
      });

      await sendPaymentSuccessEmail(
        user.email,
        user.name,
        payment.amount / 100, // Convert paise to rupees for display
        `${payment.planName} - ${payment.planDuration.replace(/_/g, ' ').toUpperCase()}`,
        receiptUrl,
        user.subscription!.endDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        paymentEntity.id,
        paymentMethod
      );

      console.log('✅ Receipt generated and email sent to:', user.email);
    } catch (receiptError) {
      console.error('⚠️ Receipt generation failed:', receiptError);
      // Don't fail - payment is already marked success
    }
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
  }
}

async function handlePaymentFailed(event: any) {
  try {
    const paymentEntity = event.payload.payment.entity;
    const orderId = paymentEntity.order_id;

    console.log('❌ Processing payment failure:', {
      orderId,
      paymentId: paymentEntity.id,
      reason: paymentEntity.failure_reason,
    });

    // Update payment record
    await Payment.findOneAndUpdate(
      { orderId },
      {
        status: 'failed',
        failureReason: paymentEntity.failure_reason,
      }
    );

    console.log('📝 Payment marked as failed');
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

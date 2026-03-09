import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { InternshipPayment } from '@/models/InternshipPayment';
import { User } from '@/models/User';
import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateHTMLPDFReceiptBuffer } from '@/lib/receiptGenerator';
import { uploadReceiptToCloudinary } from '@/lib/cloudinary';
import { sendPaymentSuccessEmail, sendInternshipWelcomeEmail } from '@/lib/email';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log('Internship verify-payment - No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;

    console.log('Internship verify-payment - Session:', userEmail);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    console.log('Internship verify-payment - Request data:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });

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

    // Find and update internship payment record
    const payment = await InternshipPayment.findOneAndUpdate(
      { paymentId: razorpay_order_id, paymentStatus: 'pending' },
      {
        paymentId: razorpay_payment_id,
        paymentStatus: 'Success',
      },
      { new: true }
    ).populate('user');

    if (!payment) {
      console.error('❌ Internship payment record not found for order:', razorpay_order_id);
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    console.log('✅ Internship payment verified successfully');

    // Fetch user details
    const user = payment.user as any;
    const userName = user?.name || userEmail.split('@')[0];

    // Generate receipt and send emails
    try {
      console.log('🧾 Generating internship payment receipt...');

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
        serviceDescription: payment.internshipTitle,
        amountInRupees: payment.amountPaid,
        paymentMethod: paymentDetails.method || 'Online Payment',
        transactionId: razorpay_payment_id,
        serviceStartDate: payment.startDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        serviceEndDate: payment.endDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        paymentStatus: 'Success',
        duration: 2, // 2 months
      };

      const pdfBuffer = await generateHTMLPDFReceiptBuffer(receiptData);
      const fileName = `internship-receipt-${payment._id}-${Date.now()}.pdf`;
      const receiptUrl = await uploadReceiptToCloudinary(pdfBuffer, fileName);

      // Update payment with receipt URL
      await InternshipPayment.findByIdAndUpdate(payment._id, {
        receiptUrl: receiptUrl,
      });

      // Send payment success email
      await sendPaymentSuccessEmail(
        userEmail,
        userName,
        payment.amountPaid / 100, // Convert paise to rupees
        payment.internshipTitle,
        receiptUrl,
        receiptData.serviceEndDate,
        razorpay_payment_id,
        receiptData.paymentMethod
      );

      // Send welcome email with Google Form link
      const googleFormLink = "https://forms.google.com/your-internship-form"; // Replace with actual link
      await sendInternshipWelcomeEmail(userEmail, userName, googleFormLink);

      console.log('✅ Internship payment receipt generated and emails sent to:', userEmail);
    } catch (emailError) {
      console.error('⚠️ Error sending internship emails:', emailError);
      // Don't fail the payment verification if email fails
    }

    const response = NextResponse.json({
      success: true,
      message: 'Internship payment verified successfully',
      payment: {
        id: payment._id,
        amount: payment.amountPaid,
        internshipTitle: payment.internshipTitle,
        status: 'Success',
        receiptUrl: payment.receiptUrl,
      },
    });

    return response;
  } catch (error) {
    console.error('Internship payment verification error:', error);
    return NextResponse.json({ error: 'Failed to verify internship payment' }, { status: 500 });
  }
}
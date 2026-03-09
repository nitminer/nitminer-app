import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { Payment } from '@/models/Payment';
import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';

// Validate Razorpay keys
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ Missing Razorpay keys');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('Payment initiate - Session:', session?.user?.email);

    if (!session?.user?.email) {
      console.log('Payment initiate - No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      console.log('Payment initiate - Invalid JSON body');
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { plan, amount, duration, customerName, paymentType, internshipId, internshipTitle, productName, productDescription } = requestData;

    console.log('Payment initiate - Request data:', { email: session.user.email, plan, amount, duration, paymentType, internshipId });

    // Validate required fields based on payment type
    if (!amount) {
      console.log('Payment initiate - Missing amount field');
      return NextResponse.json({ error: 'Missing amount field' }, { status: 400 });
    }

    if (paymentType === 'internship') {
      if (!internshipId || !internshipTitle) {
        console.log('Payment initiate - Missing internship details');
        return NextResponse.json({ error: 'Missing internship details' }, { status: 400 });
      }
    } else {
      if (!plan) {
        console.log('Payment initiate - Missing plan field');
        return NextResponse.json({ error: 'Missing plan field' }, { status: 400 });
      }
    }

    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Map duration to plan duration enum (for subscription plans)
    const durationMap: { [key: string]: '1_month' | '6_months' | '12_months' } = {
      '1': '1_month',
      '6': '6_months',
      '12': '12_months',
    };
    const planDuration = paymentType === 'internship' ? '1_month' : (durationMap[String(duration || '12')] || '12_months');

    // Create Razorpay order
    const notes: any = {
      email: session.user.email,
      paymentType: paymentType || 'subscription',
    };

    if (paymentType === 'internship') {
      notes.internshipId = internshipId;
      notes.internshipTitle = internshipTitle;
      notes.productName = productName;
    } else {
      notes.plan = plan;
      notes.duration = duration;
    }

    const options = {
      amount: amount, // Amount is already in paise from frontend (no need to multiply again)
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes,
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (razorpayError) {
      console.error('Razorpay order creation error:', razorpayError);
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
    }

    // Store initial payment record
    const paymentData: any = {
      userEmail: session.user.email,
      customerName: customerName || session.user.name || session.user.email,
      orderId: order.id,
      amount,
      paymentMethod: 'razorpay',
      status: 'pending',
    };

    if (paymentType === 'internship') {
      paymentData.planName = internshipTitle || 'Internship';
      paymentData.planDuration = '1_month';
      paymentData.internshipId = internshipId;
    } else {
      paymentData.planName = plan;
      paymentData.planDuration = planDuration;
    }

    try {
      const payment = await Payment.create(paymentData);
      console.log('✅ Payment record created:', payment._id);
    } catch (paymentError) {
      console.error('Payment record creation error:', paymentError);
      // Continue even if payment record fails, order is created in Razorpay
    }

    console.log('✅ Payment order created:', order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('❌ Payment initiate error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { Payment } from '@/models/Payment';
import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });

    console.log('Payment initiate - Session:', token?.email);

    if (!token?.email) {
      console.log('Payment initiate - No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, amount, duration, customerName } = await req.json();

    console.log('Payment initiate - Request data:', { email: token.email, plan, amount, duration, customerName });

    if (!plan || !amount) {
      console.log('Payment initiate - Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Map duration to plan duration enum
    const durationMap: { [key: string]: '1_month' | '6_months' | '12_months' } = {
      '1': '1_month',
      '6': '6_months',
      '12': '12_months',
    };
    const planDuration = durationMap[String(duration || '12')] || '12_months';

    // Create Razorpay order
    const options = {
      amount: amount, // Amount is already in paise from frontend (no need to multiply again)
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        email: token.email,
        plan,
        duration,
      },
    };

    const order = await razorpay.orders.create(options);

    // Store initial payment record
    const payment = await Payment.create({
      userEmail: token.email,
      customerName: customerName || token.name || token.email,
      planName: plan,
      planDuration,
      orderId: order.id,
      amount,
      paymentMethod: 'razorpay',
      status: 'pending',
    });

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
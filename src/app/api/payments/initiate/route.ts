import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Payment } from '@/models/Payment';
import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('Payment initiate - Session:', session?.user?.email, 'ID:', session?.user?.id);

    if (!session?.user?.email) {
      console.log('Payment initiate - No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, plan, amount, duration, durationUnit, planDisplayName } = await req.json();

    console.log('Payment initiate - Request data:', { email, plan, amount, duration, durationUnit, planDisplayName });

    if (!email || !plan || !amount || !duration || !durationUnit) {
      console.log('Payment initiate - Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Find user by email to get user ID
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      console.log('Payment initiate - User not found:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create Razorpay order
    const options = {
      amount: amount, // amount in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        email,
        plan,
        planDisplayName,
        duration: `${duration} ${durationUnit}`,
      },
    };

    const order = await razorpay.orders.create(options);

    // Store initial payment record
    const paymentPlan = duration === 1 ? '1_month' : duration === 6 ? '6_months' : '12_months';
    const payment = await Payment.create({
      userId: user._id.toString(),
      plan: paymentPlan,
      amount: amount / 100, // Convert from paise to rupees
      paymentMethod: 'razorpay',
      paymentId: order.id,
      orderId: order.id,
      status: 'pending',
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}
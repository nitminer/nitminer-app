import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { InternshipPayment } from '@/models/InternshipPayment';
import { User } from '@/models/User';
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

    console.log('Internship create-order - Session:', session?.user?.email);

    if (!session?.user?.email) {
      console.log('Internship create-order - No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      console.log('Internship create-order - Invalid JSON body');
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { amount, isDemo = false } = requestData;

    console.log('Internship create-order - Request data:', { email: session.user.email, amount, isDemo });

    // Validate required fields
    if (!amount) {
      console.log('Internship create-order - Missing amount field');
      return NextResponse.json({ error: 'Missing amount field' }, { status: 400 });
    }

    // For demo, amount should be 500 (₹5), for real it's 50000 (₹500)
    const expectedAmount = isDemo ? 500 : 50000; // in paise
    if (amount !== expectedAmount) {
      console.log('Internship create-order - Invalid amount:', amount, 'expected:', expectedAmount);
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a COMPLETED internship payment
    const existingPayment = await InternshipPayment.findOne({ user: user._id, paymentStatus: 'Success' });
    if (existingPayment && !isDemo) {
      return NextResponse.json({ error: 'User already enrolled in internship' }, { status: 400 });
    }

    // Create Razorpay order
    const notes: any = {
      email: session.user.email,
      paymentType: 'internship',
      isDemo: isDemo.toString(),
    };

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `rcpt_internship_${Date.now()}`,
      notes,
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (razorpayError) {
      console.error('Razorpay order creation error:', razorpayError);
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
    }

    // Store initial internship payment record
    const paymentData = {
      user: user._id,
      internshipTitle: isDemo ? "Demo Internship (Testing Payment Integration)" : "AI + Software Testing Internship",
      amountPaid: amount,
      originalPrice: isDemo ? 500 : 10000,
      discountApplied: isDemo ? "0%" : "50%",
      paymentId: order.id, // temporary, will be updated on verification
      paymentStatus: 'pending',
    };

    try {
      const payment = await InternshipPayment.create(paymentData);
      console.log('✅ Internship payment record created:', payment._id);
    } catch (paymentError) {
      console.error('Internship payment record creation error:', paymentError);
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    console.log('✅ Internship order created:', order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('❌ Internship create-order error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create internship order';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
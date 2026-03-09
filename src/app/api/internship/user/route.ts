import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { InternshipPayment } from '@/models/InternshipPayment';
import { User } from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get internship payment
    const payment = await InternshipPayment.findOne({ user: user._id });

    if (!payment) {
      return NextResponse.json({ hasInternship: false });
    }

    return NextResponse.json({
      hasInternship: true,
      internship: {
        title: payment.internshipTitle,
        amountPaid: payment.amountPaid,
        paymentId: payment.paymentId,
        paymentStatus: payment.paymentStatus,
        receiptUrl: payment.receiptUrl,
        startDate: payment.startDate,
        endDate: payment.endDate,
        googleFormFilled: false, // You can add a field to track this
      },
    });
  } catch (error) {
    console.error('Error fetching user internship:', error);
    return NextResponse.json({ error: 'Failed to fetch internship data' }, { status: 500 });
  }
}
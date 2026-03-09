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

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all internship payments with user details
    const payments = await InternshipPayment.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const students = payments.map((payment: any) => ({
      id: payment._id,
      name: payment.user.name,
      email: payment.user.email,
      paymentId: payment.paymentId,
      amount: payment.amountPaid / 100, // Convert to rupees
      receiptUrl: payment.receiptUrl,
      date: payment.createdAt,
      internshipTitle: payment.internshipTitle,
      status: payment.paymentStatus,
    }));

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching internship students:', error);
    return NextResponse.json({ error: 'Failed to fetch internship students' }, { status: 500 });
  }
}
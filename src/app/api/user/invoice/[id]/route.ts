import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { Payment } from '@/models/Payment';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const payment = await Payment.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!payment) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // If invoice URL exists, return it
    if (payment.invoiceUrl) {
      return NextResponse.json({ invoiceUrl: payment.invoiceUrl });
    }

    // Otherwise, you can generate one here (integrate with Cloudinary)
    return NextResponse.json({
      payment,
      message: 'Invoice generation not yet implemented',
    });
  } catch (error) {
    console.error('Invoice fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

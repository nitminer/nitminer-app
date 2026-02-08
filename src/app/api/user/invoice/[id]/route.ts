import dbConnect from '@/lib/dbConnect';
import { Payment } from '@/models/Payment';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Extract JWT token from cookies
    const accessToken = req.cookies.get('accessToken')?.value;

    if (!accessToken) {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (decoded.type !== 'access' || !decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const payment = await Payment.findOne({
      _id: id,
      userId: decoded.userId,
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

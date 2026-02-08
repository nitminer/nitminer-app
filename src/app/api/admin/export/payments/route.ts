import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { Payment } from '@/models/Payment';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token?.email || token.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const payments = await Payment.find({ status: 'success' })
      .sort({ createdAt: -1 })
      .lean();

    // Format data for CSV export
    const csvData = payments.map((payment: any) => ({
      'Payment ID': payment.paymentId,
      'Email': payment.userEmail,
      'Plan': payment.planName,
      'Duration': payment.planDuration,
      'Amount': `₹${(payment.amount / 100).toFixed(2)}`,
      'Date': new Date(payment.createdAt).toLocaleDateString(),
      'Status': payment.status,
    }));

    // Create CSV content
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map((row: any) =>
        headers.map((header) => `"${row[header]}"`).join(',')
      ),
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="payments.csv"',
      },
    });
  } catch (error) {
    console.error('Export payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

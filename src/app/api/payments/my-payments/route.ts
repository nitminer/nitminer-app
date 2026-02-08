import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { Payment } from '@/models/Payment';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/payments/my-payments
 * Get current user's payment history
 * Accessible by any authenticated user (shows only their own payments)
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Build query - always filter by user's email
    const query: any = { userEmail: token.email };

    // Optionally filter by status
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Payment.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    console.log(`📋 Fetched ${payments.length} payments for user: ${token.email}`);

    return NextResponse.json({
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching user payments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

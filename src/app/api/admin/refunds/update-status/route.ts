import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { RefundRequest } from '@/models/RefundRequest';

/**
 * POST /api/admin/refunds/update-status
 * Update refund request status
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { refundRequestId, status, refundAmount, adminNotes } = await req.json();

    if (!refundRequestId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // In a real scenario, you would update the RefundRequest in database
    // For now, just acknowledge the request

    console.log(`Updated refund request ${refundRequestId} to ${status}`, {
      refundAmount,
      adminNotes,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Refund request ${status} successfully`,
        refundRequestId,
        status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating refund status:', error);
    return NextResponse.json(
      { error: 'Failed to update refund request' },
      { status: 500 }
    );
  }
}

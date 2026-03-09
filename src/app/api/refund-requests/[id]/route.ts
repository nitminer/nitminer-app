import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { RefundRequest } from '@/models/RefundRequest';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const refundRequest = await RefundRequest.findById(id);

    if (!refundRequest) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      );
    }

    // Check access control
    if (session.user.role !== 'admin' && refundRequest.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      data: refundRequest,
    });
  } catch (error) {
    console.error('Refund request GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status, adminNotes } = await request.json();

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await dbConnect();

    const refundRequest = await RefundRequest.findById(id);

    if (!refundRequest) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      );
    }

    refundRequest.status = status;
    if (adminNotes) {
      refundRequest.adminNotes = adminNotes;
    }
    refundRequest.updatedAt = new Date();

    await refundRequest.save();

    return NextResponse.json({
      message: 'Refund request updated successfully',
      data: refundRequest,
    });
  } catch (error) {
    console.error('Refund request PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

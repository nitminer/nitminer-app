import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { RefundChat } from '@/models/RefundChat';
import { RefundRequest } from '@/models/RefundRequest';

/**
 * GET /api/refunds/[id]/chat
 * Get chat messages for a refund request
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;

    // Verify refund request exists and user has access
    const refundRequest = await RefundRequest.findById(id);
    if (!refundRequest) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      );
    }

    if (session.user?.role !== 'admin' && refundRequest.userId.toString() !== session.user?.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const messages = await RefundChat.find({ refundRequestId: id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching refund chat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/refunds/[id]/chat
 * Send a message in refund request chat
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    const { id } = await params;

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Verify refund request exists and user has access
    const refundRequest = await RefundRequest.findById(id);
    if (!refundRequest) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      );
    }

    if (session.user?.role !== 'admin' && refundRequest.userId.toString() !== session.user?.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Create and save message
    const refundMessage = new RefundChat({
      refundRequestId: id,
      senderId: session.user?.id,
      senderEmail: session.user?.email,
      senderName: session.user?.name || 'User',
      senderRole: session.user?.role || 'user',
      message: message.trim(),
      read: false,
    });

    await refundMessage.save();

    // Update refund request with last message
    await RefundRequest.findByIdAndUpdate(id, {
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: refundMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending refund message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

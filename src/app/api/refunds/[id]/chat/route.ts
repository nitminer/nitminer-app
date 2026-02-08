import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
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
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
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

    if (token.role !== 'admin' && refundRequest.userId.toString() !== token.id) {
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
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const { id } = await params;

    if (!token) {
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

    if (token.role !== 'admin' && refundRequest.userId.toString() !== token.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Create and save message
    const refundMessage = new RefundChat({
      refundRequestId: id,
      senderId: token.id,
      senderEmail: token.email,
      senderName: token.name || 'User',
      senderRole: token.role || 'user',
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

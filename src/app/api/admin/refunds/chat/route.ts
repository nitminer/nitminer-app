import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';

/**
 * POST /api/admin/refunds/chat
 * Send a chat message in a refund request thread
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

    const { refundRequestId, message } = await req.json();

    if (!refundRequestId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real scenario, you would:
    // 1. Create a message record in database
    // 2. Send notification to user
    // 3. Update refund request's lastMessage

    console.log(`New message for refund request ${refundRequestId}:`, message);

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully',
        refundRequestId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

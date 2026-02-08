import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';

/**
 * POST /api/inbox/close-conversation
 * Close a conversation
 */
export async function POST(req: NextRequest) {
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

    const { conversationId } = await req.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversation ID' },
        { status: 400 }
      );
    }

    // In a real scenario, you would:
    // 1. Update conversation status to 'closed' in database
    // 2. Send notification to other party

    console.log(`Closed conversation ${conversationId}`, {
      userId: token.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Conversation closed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error closing conversation:', error);
    return NextResponse.json(
      { error: 'Failed to close conversation' },
      { status: 500 }
    );
  }
}

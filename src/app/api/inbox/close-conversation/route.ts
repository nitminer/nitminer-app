import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';

/**
 * POST /api/inbox/close-conversation
 * Close a conversation
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
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
      userId: session.user.id,
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

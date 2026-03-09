import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';

/**
 * POST /api/inbox/send-message
 * Send a message in a conversation
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

    const { conversationId, message, role } = await req.json();

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real scenario, you would:
    // 1. Create a message record in database
    // 2. Update conversation's lastMessage and updatedAt
    // 3. Send notifications

    console.log(`New message in conversation ${conversationId}:`, {
      message,
      role,
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully',
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

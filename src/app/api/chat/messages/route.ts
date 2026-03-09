import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ChatSession from '@/models/ChatSession';
import ChatMessage from '@/models/ChatMessage';
import { getServerSession } from 'next-auth';




export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { sessionId, message, sender, userId } = await request.json();

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or update chat session
    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = new ChatSession({
        sessionId,
        userId,
        status: 'active',
        startedAt: new Date(),
      });
      await session.save();
    }

    // Save message
    const chatMessage = new ChatMessage({
      sessionId,
      sender,
      message,
      userId,
      timestamp: new Date(),
    });
    await chatMessage.save();

    return NextResponse.json({
      success: true,
      message: chatMessage,
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const messages = await ChatMessage.find({ sessionId })
      .sort({ timestamp: 1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

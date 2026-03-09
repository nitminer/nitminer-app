import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ChatSession from '@/models/ChatSession';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Fetch all chat sessions, sorted by most recent first
    const sessions = await ChatSession.find({})
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}

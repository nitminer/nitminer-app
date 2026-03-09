import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ChatSession from '@/models/ChatSession';
import ChatMessage from '@/models/ChatMessage';

export async function DELETE(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    // Standardizing params for Next.js compatibility
    const resolvedParams = params instanceof Promise ? await params : params;
    const { sessionId } = resolvedParams;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    await dbConnect();

    // Cleanup logic
    await ChatMessage.deleteMany({ sessionId });
    const result = await ChatSession.findOneAndDelete({ sessionId });

    // If result is null, it might have been deleted by another cleanup trigger.
    // Return 200 to prevent console 404 errors during unmounting.
    return NextResponse.json({ success: true, alreadyDeleted: !result });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
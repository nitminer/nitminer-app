import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * OPTIONS /api/rag/chat
 * Handle CORS preflight requests
 */
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * POST /api/rag/chat
 * 
 * Save chat session and messages
 * 
 * Request body:
 * {
 *   "sessionId": "123456-abc",
 *   "message": "user question",
 *   "sender": "user|agent|system",
 *   "metadata": {}
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "messageId": "msg_1234",
 *   "timestamp": "2024-01-01T00:00:00Z"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { sessionId, message, sender, metadata = {} } = body;

    // Validate input
    if (!sessionId || !message || !sender) {
      console.warn('[Chat] Invalid input:', { sessionId: !!sessionId, message: !!message, sender: !!sender });
      return NextResponse.json(
        {
          success: false,
          error: 'sessionId, message, and sender are required',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Log the message (In production, you'd save to DB)
    const messageRecord = {
      messageId: `msg_${Date.now()}`,
      sessionId,
      message,
      sender,
      metadata,
      timestamp: new Date().toISOString(),
    };

    console.log('[Chat Message]:', messageRecord);

    return NextResponse.json(
      {
        success: true,
        messageId: messageRecord.messageId,
        timestamp: messageRecord.timestamp,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Chat Error]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: `Failed to save message: ${errorMessage}`,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

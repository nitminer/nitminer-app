import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ChatSession from '@/models/ChatSession';
import { chatRateLimiter } from '@/lib/rateLimiter';
import { chatCache } from '@/lib/cache';

interface CachedChatSession {
  sessionId: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: string;
  startedAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId, userEmail, userName } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Apply rate limiting (30 messages per minute)
    const { allowed, remaining, resetTime } = await chatRateLimiter.isAllowed(clientIp);

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many chat messages. Please slow down.',
          remaining: 0,
          resetTime,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(resetTime),
          },
        }
      );
    }

    // Check if session already cached
    const cacheKey = `chat:session:${sessionId}`;
    const cachedSession = await chatCache.get<CachedChatSession>(cacheKey);

    if (cachedSession) {
      console.log(`✅ Chat session cache hit for ${sessionId}`);
      return NextResponse.json({
        success: true,
        sessionId: cachedSession.sessionId,
        message: 'Chat session retrieved from cache',
        fromCache: true,
      });
    }

    await dbConnect();

    // Create or update the chat session
    const chatSession = await ChatSession.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        userId,
        userEmail,
        userName,
        status: 'waiting',
        startedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Cache the session for 1 hour
    await chatCache.set(
      cacheKey,
      {
        sessionId: chatSession.sessionId,
        userId: chatSession.userId,
        userEmail: chatSession.userEmail,
        userName: chatSession.userName,
        status: chatSession.status,
        startedAt: chatSession.startedAt,
      },
      3600
    );

    console.log('💾 ChatSession created:', {
      sessionId,
      userId,
      userEmail,
      userName,
      rateRemaining: remaining,
    });

    return NextResponse.json({
      success: true,
      sessionId: chatSession.sessionId,
      message: 'Chat session created successfully',
      remaining,
      resetTime,
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SessionManagement } from '@/models/SessionManagement';

/**
 * GET /api/auth/session/validate
 * Validate if a session is still active
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { sessionToken } = body;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Missing session token' },
        { status: 400 }
      );
    }

    // Find session
    const session = await SessionManagement.findOne({
      sessionToken,
    });

    if (!session) {
      return NextResponse.json(
        { isValid: false, reason: 'Session not found' },
        { status: 200 }
      );
    }

    if (!session.isActive) {
      return NextResponse.json(
        { isValid: false, reason: 'Session has been invalidated' },
        { status: 200 }
      );
    }

    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { isValid: false, reason: 'Session has expired' },
        { status: 200 }
      );
    }

    // Update last activity
    session.lastActivity = new Date();
    await session.save();

    return NextResponse.json(
      {
        isValid: true,
        session: {
          id: session._id,
          userId: session.userId,
          email: session.email,
          deviceName: session.deviceName,
          lastActivity: session.lastActivity,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405 }
  );
}

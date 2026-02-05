import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SessionManagement } from '@/models/SessionManagement';

/**
 * POST /api/auth/session/logout
 * Logout a session
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

    // Mark session as inactive
    const result = await SessionManagement.findOneAndUpdate(
      { sessionToken },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
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

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SessionManagement } from '@/models/SessionManagement';

/**
 * POST /api/auth/session/invalidate-others
 * Invalidate all other sessions for the user
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, deviceId } = body;

    if (!userId || !deviceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Invalidate all sessions except the current one
    const result = await SessionManagement.updateMany(
      { userId, deviceId: { $ne: deviceId }, isActive: true },
      { isActive: false }
    );

    return NextResponse.json(
      {
        success: true,
        invalidatedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session invalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate sessions' },
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

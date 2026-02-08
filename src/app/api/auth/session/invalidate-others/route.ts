import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SessionManagement } from '@/models/SessionManagement';

/**
 * POST /api/auth/session/invalidate-others
 * Invalidate all other sessions for the user (keeping current device active)
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, userId, deviceId } = body;

    // Accept either email or userId, and deviceId is required
    if (!deviceId || (!email && !userId)) {
      return NextResponse.json(
        { error: 'Missing required fields (email or userId, and deviceId required)' },
        { status: 400 }
      );
    }

    console.log(`[INVALIDATE] Invalidating other sessions for device: ${deviceId}`);

    // If email provided, use it directly for query
    const queryField = email ? 'email' : 'userId';
    const queryValue = email ? email.toLowerCase() : userId;

    // Invalidate all sessions except the current device
    const result = await SessionManagement.updateMany(
      { 
        [queryField]: queryValue,
        deviceId: { $ne: deviceId }, // Keep current device active
        isActive: true 
      },
      { 
        isActive: false,
        updatedAt: new Date(),
      }
    );

    console.log(`[INVALIDATE] ✅ Invalidated ${result.modifiedCount} other sessions`);

    return NextResponse.json(
      {
        success: true,
        invalidatedCount: result.modifiedCount,
        message: `Invalidated ${result.modifiedCount} other session(s). This device is now the only active session.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[INVALIDATE] Error:', error);
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

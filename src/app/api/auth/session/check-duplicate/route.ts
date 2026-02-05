import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SessionManagement } from '@/models/SessionManagement';

/**
 * POST /api/auth/session/check-duplicate
 * Check if another device/browser is already logged in with this email
 * Strictly prevents multi-browser and multi-device login
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, deviceId, deviceFingerprint, browser } = body;

    if (!email || !deviceId || !deviceFingerprint) {
      console.warn('check-duplicate: Missing required fields', { email, deviceId, browser });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    console.log(`Checking duplicate sessions for ${normalizedEmail}, browser: ${browser}`);

    // Find ALL active sessions for this email (strict check)
    const activeSessions = await SessionManagement.find({
      email: normalizedEmail,
      isActive: true,
    });

    console.log(`Found ${activeSessions.length} active sessions for ${normalizedEmail}`);

    // Check for ANY other session (different device or different browser)
    const otherSessions = activeSessions.filter((session) => {
      const isDifferentDevice = session.deviceId !== deviceId;
      const isDifferentBrowser = session.browser !== browser;
      
      console.log(`Session check - Device: ${session.deviceId} vs ${deviceId} (different: ${isDifferentDevice}), Browser: ${session.browser} vs ${browser} (different: ${isDifferentBrowser})`);
      
      // Prevent login if different device
      if (isDifferentDevice) {
        return true;
      }
      // Prevent login if same device but different browser
      if (isDifferentBrowser) {
        return true;
      }
      return false;
    });

    console.log(`Found ${otherSessions.length} conflicting sessions`);

    if (otherSessions.length > 0) {
      return NextResponse.json(
        {
          isDuplicate: true,
          existingSessions: otherSessions.map((session) => ({
            id: session._id,
            deviceName: session.deviceName,
            browser: session.browser,
            os: session.os,
            loginTime: session.loginTime,
            lastActivity: session.lastActivity,
            ipAddress: session.ipAddress,
          })),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { isDuplicate: false, existingSessions: [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Duplicate session check error:', error);
    return NextResponse.json(
      { error: 'Failed to check duplicate sessions' },
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

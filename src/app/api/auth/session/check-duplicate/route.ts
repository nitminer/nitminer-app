import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SessionManagement } from '@/models/SessionManagement';
import { User } from '@/models/User';
import crypto from 'crypto';

/**
 * POST /api/auth/session/check-duplicate
 * Check if another device/browser is already logged in with this email
 * Creates/updates current session and flags other sessions as duplicates
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, deviceId, deviceFingerprint, browser, os, deviceName } = body;

    if (!email || !deviceId || !deviceFingerprint) {
      console.warn('check-duplicate: Missing required fields', { email, deviceId, browser });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    console.log(`[DUPLICATE CHECK] Checking for ${normalizedEmail}, device: ${deviceId}, browser: ${browser}`);

    // Get or create user
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`[DUPLICATE CHECK] User not found, creating...`);
      user = await User.create({
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: 'user',
        trialCount: 5,
        isPremium: false,
      });
    }

    // Get client IP
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Check if a session already exists for this SAME device
    const existingDeviceSession = await SessionManagement.findOne({
      email: normalizedEmail,
      deviceId: deviceId,
      isActive: true,
    });

    if (existingDeviceSession) {
      // Update last activity on existing session
      existingDeviceSession.lastActivity = new Date();
      await existingDeviceSession.save();
      console.log(`[DUPLICATE CHECK] ✅ Updated existing session for same device`);
    } else {
      // Create new session for current device
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const newSession = new SessionManagement({
        userId: user._id,
        email: normalizedEmail,
        deviceId,
        deviceFingerprint,
        deviceName: deviceName || 'Unknown Device',
        browser: browser || 'Unknown',
        os: os || 'Unknown',
        ipAddress,
        sessionToken,
        isActive: true,
        loginTime: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      await newSession.save();
      console.log(`[DUPLICATE CHECK] ✅ Created new session for device: ${deviceId}`);
    }

    // Now find other ACTIVE sessions from DIFFERENT devices
    const otherActiveSessions = await SessionManagement.find({
      email: normalizedEmail,
      deviceId: { $ne: deviceId }, // Different device
      isActive: true,
    });

    console.log(`[DUPLICATE CHECK] Found ${otherActiveSessions.length} other active sessions`);

    if (otherActiveSessions.length > 0) {
      return NextResponse.json(
        {
          isDuplicate: true,
          existingSessions: otherActiveSessions.map((session) => ({
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

    // No other active sessions found
    return NextResponse.json(
      { isDuplicate: false, existingSessions: [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DUPLICATE CHECK] Error:', error);
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

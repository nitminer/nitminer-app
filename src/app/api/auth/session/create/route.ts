import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SessionManagement } from '@/models/SessionManagement';
import { User } from '@/models/User';
import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * POST /api/auth/session/create
 * Create a new session for the user
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    let {
      userId,
      email,
      deviceId,
      deviceFingerprint,
      deviceName,
      browser,
      os,
    } = body;

    if (!email || !deviceId || !deviceFingerprint) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`[SESSION] Creating session for email: ${email}`);

    // Always look up user by email to get valid ObjectId
    let user = null;
    try {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        console.log(`[SESSION] ✅ Found existing user: ${user._id}`);
      } else {
        console.log(`[SESSION] ⚠️ User not found for email: ${email}`);
      }
    } catch (err) {
      console.error('Error finding user:', err);
    }

    // If user not found, create a basic user record (shouldn't happen if signup worked)
    if (!user) {
      console.warn(`[SESSION] Creating basic user record for ${email}...`);
      try {
        user = await User.create({
          name: email.split('@')[0], // Use part before @ as name
          email: email.toLowerCase(),
          role: 'user',
          trialCount: 0,
          isPremium: false,
        });
        console.log(`[SESSION] ✅ Created user record: ${user._id}`);
      } catch (createErr) {
        console.error('[SESSION] ❌ Error creating user:', createErr);
        return NextResponse.json(
          { error: 'Failed to create user session. Please sign up first.' },
          { status: 400 }
        );
      }
    }

    // Use the user's ObjectId from database
    userId = user._id;

    // Get client IP
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Generate unique session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Check if user has other active sessions
    const existingSessions = await SessionManagement.find({
      email: email.toLowerCase(),
      isActive: true,
    });

    console.log(`Creating session for ${email}, found ${existingSessions.length} existing sessions`);

    // Invalidate all previous sessions for this email
    if (existingSessions.length > 0) {
      await SessionManagement.updateMany(
        { email: email.toLowerCase(), isActive: true },
        { isActive: false }
      );
      console.log(`Invalidated ${existingSessions.length} previous sessions`);
    }

    // Create new session
    const newSession = new SessionManagement({
      userId,
      email: email.toLowerCase(),
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
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    await newSession.save();
    console.log(`New session created: ${newSession._id}`);

    return NextResponse.json(
      {
        success: true,
        sessionToken,
        sessionId: newSession._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
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
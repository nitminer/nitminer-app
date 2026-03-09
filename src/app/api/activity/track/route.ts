import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { UserActivity } from '@/models/UserActivity';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Move to environment or shared config
const INACTIVITY_TIMEOUT_MINUTES = 180; // 3 hours

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      action = 'page_view',
      page = null,
      details = null,
      sessionId = null,
      device = 'Unknown',
      browser = 'Unknown',
      os = 'Unknown',
    } = body;

    // Get client IP
    const ipAddress = 
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'Unknown';

    const userAgent = request.headers.get('user-agent') || 'Unknown';

    await dbConnect();

    // Find or create user activity record
    let userActivity = await UserActivity.findOne({
      userId: session.user.id,
      email: session.user.email,
    });

    if (!userActivity) {
      userActivity = new UserActivity({
        userId: session.user.id,
        email: session.user.email,
        sessionId,
        lastLogin: new Date(),
        lastActive: new Date(),
        ipAddress,
        userAgent,
        device,
        browser,
        os,
        isOnline: true,
        activities: [
          {
            action,
            page,
            timestamp: new Date(),
            details,
          },
        ],
        activityCount: 1,
      });
    } else {
      // Update existing record
      userActivity.lastActive = new Date();
      userActivity.sessionId = sessionId || userActivity.sessionId;
      userActivity.lastActivityAction = action;
      userActivity.lastActivityPage = page;
      userActivity.ipAddress = ipAddress;
      userActivity.userAgent = userAgent;
      userActivity.device = device;
      userActivity.browser = browser;
      userActivity.os = os;
      userActivity.isOnline = true;
      userActivity.activityCount = (userActivity.activityCount || 0) + 1;

      // Add to activities array (keep last 100)
      const activitiesArray = (userActivity.activities || []) as typeof userActivity.activities;
      activitiesArray.push({
        action,
        page,
        timestamp: new Date(),
        details,
      });

      if (activitiesArray.length > 100) {
        userActivity.activities = activitiesArray.slice(-100) as any;
      } else {
        userActivity.activities = activitiesArray;
      }

      // Calculate inactivity time
      const timeSinceLastLogin = Date.now() - new Date(userActivity.lastLogin).getTime();
      const sessionDurationMinutes = Math.floor(timeSinceLastLogin / (1000 * 60));
      userActivity.sessionDuration = sessionDurationMinutes;
    }

    await userActivity.save();

    // Check if session should be invalidated (3 hours of inactivity)
    const lastActivityTime = new Date(userActivity.lastActive).getTime();
    const currentTime = Date.now();
    const inactiveMinutes = Math.floor((currentTime - lastActivityTime) / (1000 * 60));
    
    const isSessionExpired = inactiveMinutes > INACTIVITY_TIMEOUT_MINUTES;

    return NextResponse.json({
      success: true,
      message: 'Activity tracked successfully',
      sessionExpired: isSessionExpired,
      inactiveMinutes,
      action,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Activity tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const userActivity = await UserActivity.findOne({
      userId: session.user.id,
      email: session.user.email,
    });

    if (!userActivity) {
      return NextResponse.json({
        isOnline: false,
        lastActive: null,
        inactiveMinutes: null,
      });
    }

    const lastActivityTime = new Date(userActivity.lastActive).getTime();
    const currentTime = Date.now();
    const inactiveMinutes = Math.floor((currentTime - lastActivityTime) / (1000 * 60));

    return NextResponse.json({
      isOnline: userActivity.isOnline && inactiveMinutes < INACTIVITY_TIMEOUT_MINUTES,
      lastActive: userActivity.lastActive,
      lastActivityAction: userActivity.lastActivityAction,
      inactiveMinutes,
      sessionDuration: userActivity.sessionDuration,
      activityCount: userActivity.activityCount,
      sessionExpired: inactiveMinutes > INACTIVITY_TIMEOUT_MINUTES,
    });
  } catch (error) {
    console.error('Error retrieving activity:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve activity' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';

/**
 * POST /api/auth/refresh
 * 
 * Refresh access token using refresh token
 * 1. Validates refresh token from httpOnly cookie
 * 2. Checks user tokenVersion for token invalidation
 * 3. Issues new access token
 * 4. Returns new token in httpOnly cookie
 */
export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found' },
        { status: 401 }
      );
    }

    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT secret not configured');
    }

    // Verify refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, secret);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    if (decoded.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 401 }
      );
    }

    // Connect to MongoDB and verify user still exists
    await dbConnect();
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // Check tokenVersion to invalidate old tokens if needed
    if (user.tokenVersion && decoded.tokenVersion !== user.tokenVersion) {
      return NextResponse.json(
        { error: 'Token has been invalidated' },
        { status: 401 }
      );
    }

    // Create new access token
    const newAccessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        clerkUserId: user.clerkUserId,
        tokenVersion: user.tokenVersion || 0,
        type: 'access',
      },
      secret,
      { expiresIn: '1h' }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: 'Token refreshed successfully',
      },
      { status: 200 }
    );

    // Set new access token cookie
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}

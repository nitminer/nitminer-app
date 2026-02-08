import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';

/**
 * GET /api/auth/session
 * 
 * Get current session information
 * 1. Extracts access token from httpOnly cookie
 * 2. Verifies and decodes token
 * 3. Checks tokenVersion against database (for logout invalidation)
 * 4. Returns user info if valid
 * 5. Checks if token needs refresh
 */
export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('accessToken')?.value;
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Session validation failed' },
        { status: 500 }
      );
    }

    try {
      const decoded = jwt.verify(accessToken, secret) as any;

      if (decoded.type !== 'access') {
        return NextResponse.json(
          { authenticated: false, user: null },
          { status: 200 }
        );
      }

      // Connect to database and check tokenVersion
      await dbConnect();
      const user = await User.findById(decoded.userId).select('tokenVersion firstName lastName email role');

      if (!user) {
        return NextResponse.json(
          { authenticated: false, user: null },
          { status: 200 }
        );
      }

      // Check if tokenVersion matches - if not, token was invalidated (user logged out)
      if (decoded.tokenVersion !== user.tokenVersion) {
        return NextResponse.json(
          { authenticated: false, user: null },
          { status: 200 }
        );
      }

      // Get token expiry time
      const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : null;
      const now = new Date();
      const timeUntilExpiry = expiresAt ? expiresAt.getTime() - now.getTime() : null;

      // If less than 5 minutes remaining, suggest refresh
      const needsRefresh = timeUntilExpiry && timeUntilExpiry < 5 * 60 * 1000;

      return NextResponse.json(
        {
          authenticated: true,
          user: {
            userId: decoded.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: decoded.email,
            role: decoded.role,
          },
          expiresAt,
          needsRefresh,
          hasRefreshToken: !!refreshToken,
        },
        { status: 200 }
      );
    } catch (tokenError) {
      if (tokenError instanceof jwt.TokenExpiredError) {
        // Token expired, check if refresh token available
        if (refreshToken) {
          return NextResponse.json(
            {
              authenticated: false,
              tokenExpired: true,
              canRefresh: true,
              user: null,
            },
            { status: 200 }
          );
        }
      }

      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}

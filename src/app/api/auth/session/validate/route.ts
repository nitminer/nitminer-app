import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';

/**
 * POST /api/auth/session/validate
 * Validate JWT token and return user information
 * 
 * Also validates that token has not been invalidated by logout
 * (checks tokenVersion in token against current user's tokenVersion)
 *
 * Request body:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 *
 * Response (valid token):
 * {
 *   "isValid": true,
 *   "user": {
 *     "id": "user_id",
 *     "email": "user@example.com",
 *     "name": "User Name",
 *     "role": "user",
 *     "isPremium": false,
 *     "trialCount": 3
 *   },
 *   "expiresAt": "2026-02-13T10:30:00Z"
 * }
 *
 * Response (invalid token):
 * {
 *   "isValid": false,
 *   "reason": "Token expired" | "Invalid token" | "Token not for TrustInn" | "Token invalidated by logout"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { isValid: false, reason: 'No token provided' },
        { status: 400 }
      );
    }

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret', {
        issuer: 'nitminer-trustinn',
        audience: 'trustinn-app',
      }) as any;

      // Check if token is for TrustInn access
      if (decoded.purpose !== 'trustinn_access') {
        return NextResponse.json(
          { isValid: false, reason: 'Token not for TrustInn access' },
          { status: 200 }
        );
      }

      // CRITICAL: Check if token has been invalidated by logout
      // If user logged out, their tokenVersion is incremented
      // If token's tokenVersion doesn't match current user's tokenVersion, token is invalidated
      try {
        await dbConnect();
        const user = await User.findById(decoded.id);
        
        if (!user) {
          return NextResponse.json(
            { isValid: false, reason: 'User not found' },
            { status: 200 }
          );
        }

        // Compare tokenVersion in token with current user's tokenVersion
        if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
          console.log(`Token invalidated for user ${decoded.email}: token version ${decoded.tokenVersion} != current version ${user.tokenVersion}`);
          return NextResponse.json(
            { isValid: false, reason: 'Token invalidated by logout' },
            { status: 200 }
          );
        }
      } catch (dbError) {
        console.error('Database error during token validation:', dbError);
        // If DB error occurs, we can't verify tokenVersion, so reject for security
        return NextResponse.json(
          { isValid: false, reason: 'Unable to verify token' },
          { status: 200 }
        );
      }

      // Token is valid, return user information
      return NextResponse.json(
        {
          isValid: true,
          user: {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
            isPremium: decoded.isPremium,
            trialCount: decoded.trialCount,
          },
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
          issuedAt: decoded.issuedAt,
        },
        { status: 200 }
      );

    } catch (jwtError: any) {
      let reason = 'Invalid token';

      if (jwtError.name === 'TokenExpiredError') {
        reason = 'Token expired';
      } else if (jwtError.name === 'JsonWebTokenError') {
        reason = 'Invalid token signature';
      } else if (jwtError.name === 'NotBeforeError') {
        reason = 'Token not active yet';
      }

      return NextResponse.json(
        { isValid: false, reason },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { isValid: false, reason: 'Server error' },
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

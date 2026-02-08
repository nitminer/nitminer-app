import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';

/**
 * POST /api/auth/generate-token
 * 
 * Generates a JWT token for TrustInn application containing complete user information
 * The token includes user details, premium status, and trial information
 * TrustInn can validate the token using /api/auth/session/validate
 * 
 * Request body:
 * {
 *   "expiresIn": "7d"  // Token expiration time
 * }
 * 
 * Response:
 * {
 *   "token": "eyJhbGc...",
 *   "expiresIn": "7d",
 *   "issuedAt": "2026-02-05T10:30:00Z",
 *   "type": "Bearer"
 * }
 * 
 * JWT Payload contains:
 * {
 *   "id": "user_id",
 *   "email": "user@example.com",
 *   "name": "User Name",
 *   "role": "user",
 *   "isPremium": false,
 *   "trialCount": 3,
 *   "purpose": "trustinn_access",
 *   "issuedAt": "2026-02-05T10:30:00Z",
 *   "iat": 1707129000,
 *   "exp": 1707733800,
 *   "iss": "nitminer-trustinn",
 *   "aud": "trustinn-app"
 * }
 */

export async function POST(req: NextRequest) {
  try {
    // Extract JWT token from cookies
    const accessToken = req.cookies.get('accessToken')?.value;

    if (!accessToken) {
      console.log('No access token found in generate-token endpoint');
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify JWT token using same method as /api/user/me
    let decoded: any;
    try {
      decoded = jwt.verify(accessToken, secret) as any;
    } catch (error) {
      console.log('Token verification failed in generate-token:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if token is access token
    if (decoded.type !== 'access') {
      console.log('Invalid token type in generate-token:', decoded.type);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token type' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const userEmail = decoded.email;
    const userRole = decoded.role || 'user';

    console.log('POST /api/auth/generate-token - Session:', {
      hasSession: true,
      userId,
      userEmail,
      userRole,
    });

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - No user ID in token' },
        { status: 401 }
      );
    }

    // Fetch complete user data from database
    await dbConnect();
    const dbUser = await User.findById(userId);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const expiresIn = body.expiresIn || '7d';

    // Generate JWT token with complete user information
    const trustinnToken = jwt.sign(
      {
        id: userId,
        email: userEmail,
        role: userRole,
        name: `${dbUser.firstName} ${dbUser.lastName}`.trim(),
        isPremium: dbUser.isPremium,
        trialCount: dbUser.trialCount,
        tokenVersion: dbUser.tokenVersion, // Include tokenVersion for logout validation
        purpose: 'trustinn_access', // Specific purpose for this token
        issuedAt: new Date().toISOString(),
      },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn,
        issuer: 'nitminer-trustinn',
        audience: 'trustinn-app',
      }
    );

    console.log(`Generated JWT token for user ${userEmail} with tokenVersion: ${dbUser.tokenVersion}`);

    return NextResponse.json(
      {
        token: trustinnToken,
        expiresIn,
        issuedAt: new Date().toISOString(),
        type: 'Bearer',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/generate-token
 * 
 * Health check for token generation endpoint
 * 
 * Related endpoints:
 * - POST /api/auth/session/validate - Validate JWT tokens
 */
export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      status: 'active',
      message: 'Token generation endpoint is operational',
      documentation: '/api/docs/auth/generate-token',
      relatedEndpoints: {
        validateToken: 'POST /api/auth/session/validate'
      }
    },
    { status: 200 }
  );
}

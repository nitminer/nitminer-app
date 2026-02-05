import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * POST /api/auth/generate-token
 * 
 * Generates a JWT token for TrustInn application
 * Token is used to validate user access and executions
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
 *   "issuedAt": "2026-02-05T10:30:00Z"
 * }
 */

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - No active session' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const expiresIn = body.expiresIn || '7d';

    // Generate JWT token
    const token = jwt.sign(
      {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        purpose: 'trustinn_access', // Specific purpose for this token
      },
      process.env.NEXTAUTH_SECRET || 'secret',
      {
        expiresIn,
        issuer: 'nitminer-trustinn',
        audience: 'trustinn-app',
      }
    );

    return NextResponse.json(
      {
        token,
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
 */
export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      status: 'active',
      message: 'Token generation endpoint is operational',
      documentation: '/api/docs/auth/generate-token',
    },
    { status: 200 }
  );
}

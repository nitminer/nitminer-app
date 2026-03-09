import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';

interface CreateSessionRequest {
  userId: string;
  email: string;
}

/**
 * POST /api/auth/create-session
 * 
 * Creates a NextAuth-compatible JWT session token for a newly created user
 * Used after custom signup endpoints to establish proper authentication
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, email } = (await req.json()) as CreateSessionRequest;

    console.log('[CREATE-SESSION] Received request:', { userId, email });

    if (!userId || !email) {
      console.error('[CREATE-SESSION] Missing required fields');
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch user from database
    const user = await User.findById(userId);
    if (!user) {
      console.error('[CREATE-SESSION] User not found:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[CREATE-SESSION] User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
    });

    // Create JWT token with NextAuth format
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('[CREATE-SESSION] Missing NEXTAUTH_SECRET');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create token payload matching NextAuth format
    const tokenPayload = {
      // NextAuth specific fields
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      jti: `${user._id}-${Date.now()}`,
      
      // User data
      id: user._id.toString(),
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      sub: user._id.toString(), // Subject claim for Google compatibility
    };

    console.log('[CREATE-SESSION] Creating JWT token with payload:', {
      id: tokenPayload.id,
      email: tokenPayload.email,
      role: tokenPayload.role,
    });

    const token = jwt.sign(tokenPayload, secret, { algorithm: 'HS256' });

    // Create response with session cookie
    const response = NextResponse.json({ success: true, token });

    // Set the NextAuth session token cookie
    response.cookies.set({
      name: 'next-auth.session-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_COOKIE_SECURE === 'true',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      domain: process.env.NEXTAUTH_COOKIE_DOMAIN || undefined,
    });

    console.log('[CREATE-SESSION] Session token created and cookie set');

    return response;
  } catch (error) {
    console.error('[CREATE-SESSION] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

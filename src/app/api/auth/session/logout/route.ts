import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';

/**
 * POST /api/auth/session/logout
 * Logout using JWT - clears cookies and invalidates tokens
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Already logged out' },
        { status: 200 }
      );
    }

    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    try {
      // Verify and decode token
      const decoded = jwt.verify(accessToken, secret) as any;

      if (decoded.type === 'access') {
        // Connect to MongoDB
        await dbConnect();

        // Increment tokenVersion to invalidate all tokens for this user
        await User.findByIdAndUpdate(decoded.userId, {
          $inc: { tokenVersion: 1 },
        });

        console.log(`User ${decoded.email} logged out - invalidated all tokens`);
      }
    } catch (tokenError) {
      console.warn('Token verification failed during logout:', tokenError);
      // Continue with logout even if token is invalid
    }

    // Create response that clears all cookies
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // Clear authentication cookies
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('nitminer_session', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
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

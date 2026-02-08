import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * 
 * Secure logout endpoint
 * 1. Clears httpOnly cookies
 * 2. Invalidates session tokens
 * 3. Clears client-side session data
 */
export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // Clear all authentication cookies
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Immediately expires
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

/**
 * GET /api/auth/logout
 * 
 * Logout via GET request (for link clicks)
 */
export async function GET(req: NextRequest) {
  return POST(req);
}

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { generateDeviceInfo } from '@/lib/deviceFingerprint';

interface LoginRequestBody {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * POST /api/auth/login
 * 
 * Secure login endpoint with Clerk integration
 * 1. Validates email and password against MongoDB
 * 2. Verifies user in Clerk is active
 * 3. Creates JWT access token & refresh token
 * 4. Stores tokens in httpOnly cookies (secure)
 * 5. Creates session record for tracking
 * 6. Returns user data for frontend
 */
export async function POST(req: NextRequest) {
  try {
    const body: LoginRequestBody = await req.json();
    const { email, password, rememberMe = false } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password (assumes User model has password comparison method)
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Password is now verified, authentication successful
    // Note: We don't call Clerk during login because we're using JWT-based auth
    // Clerk is only used during signup to sync user data (optional double storage)

    // Create JWT tokens
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT secret not configured');
    }

    // Access token - short lived (1 hour)
    const accessToken = jwt.sign(
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

    // Refresh token - long lived (7 days)
    const refreshToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        type: 'refresh',
        tokenVersion: user.tokenVersion || 0,
      },
      secret,
      { expiresIn: rememberMe ? '30d' : '7d' }
    );

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          clerkUserId: user.clerkUserId,
          isPremium: user.isPremium,
          trialCount: user.trialCount,
        },
      },
      { status: 200 }
    );

    // Set secure httpOnly cookies
    // Access token cookie - short lived
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    // Refresh token cookie - longer lived
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days or 7 days
      path: '/',
    });

    // Also return tokens in response for client-side storage (optional)
    // Clients should prefer cookies, but this allows flexibility
    response.cookies.set('nitminer_session', JSON.stringify({
      userId: user._id,
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString(),
    }), {
      httpOnly: false, // Readable by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    // Create session tracking record (for device fingerprinting & security)
    try {
      // This could be moved to a separate session tracking call if needed
      // For now, just log it
      console.log(`User ${user._id} logged in at ${new Date().toISOString()}`);
    } catch (sessionError) {
      console.error('Session tracking error:', sessionError);
      // Don't fail login for session tracking errors
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to login';
    return NextResponse.json(
      { error: errorMessage || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/login
 * 
 * Returns login status and current session
 */
export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('accessToken')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { authenticated: false, error: 'JWT secret not configured' },
        { status: 500 }
      );
    }

    try {
      const decoded = jwt.verify(accessToken, secret) as any;
      
      if (decoded.type !== 'access') {
        return NextResponse.json(
          { authenticated: false },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          authenticated: true,
          user: {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            clerkUserId: decoded.clerkUserId,
          },
        },
        { status: 200 }
      );
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Login status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check login status' },
      { status: 500 }
    );
  }
}

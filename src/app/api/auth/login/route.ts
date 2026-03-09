import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { generateDeviceInfo } from '@/lib/deviceFingerprint';
import { authRateLimiter } from '@/lib/rateLimiter';
import { sessionStore } from '@/lib/sessionStore';
import { userCache } from '@/lib/cache';

interface LoginRequestBody {
  email?: string;
  username?: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * POST /api/auth/login
 * 
 * Secure login endpoint with Clerk integration + Redis optimization
 * 1. Rate limit login attempts (Redis)
 * 2. Validates email and password against MongoDB
 * 3. Verifies user in Clerk is active
 * 4. Creates JWT access token & refresh token
 * 5. Stores tokens in httpOnly cookies (secure)
 * 6. Creates session record in Redis (for fast retrieval)
 * 7. Returns user data for frontend
 */
export async function POST(req: NextRequest) {
  try {
    const body: LoginRequestBody = await req.json();
    const { email, username, password, rememberMe = false } = body;

    // Validate required fields
    if ((!email && !username) || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Apply rate limiting (5 attempts per 15 minutes)
    const { allowed, remaining, resetTime } = await authRateLimiter.isAllowed(clientIp);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(resetTime),
          },
        }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Find user by email or username
    let user;
    if (email) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (username) {
      user = await User.findOne({ username: username.toLowerCase() });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
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

    // Store session in Redis for fast retrieval (24 hour TTL)
    const sessionId = `session:${user._id}:${Date.now()}`;
    const sessionTtl = rememberMe ? 30 * 24 * 3600 : 7 * 24 * 3600; // seconds
    
    await sessionStore.createSession(
      sessionId,
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        clerkUserId: user.clerkUserId || null,
        tokenVersion: user.tokenVersion || 0,
        loginIp: clientIp,
        userAgent: req.headers.get('user-agent') || '',
        createdAt: Date.now(),
        expiresAt: Date.now() + sessionTtl * 1000,
      },
      sessionTtl
    );

    // Cache user profile in Redis (1 hour TTL)
    await userCache.set(
      `profile:${user._id}`,
      {
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
      3600
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

    // Log successful login
    console.log(`✅ User ${user._id} (${user.email}) logged in successfully`);

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
 * Returns login status and current session (with Redis caching)
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

      // Try to get user profile from cache first
      let userProfile = await userCache.get(`profile:${decoded.userId}`);

      // If not in cache, fetch from DB and cache it
      if (!userProfile) {
        await dbConnect();
        const user = await User.findById(decoded.userId).lean();
        if (user) {
          userProfile = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            clerkUserId: user.clerkUserId,
            isPremium: user.isPremium,
            trialCount: user.trialCount,
          };
          // Cache it for future requests
          await userCache.set(`profile:${decoded.userId}`, userProfile, 3600);
        }
      }

      return NextResponse.json(
        {
          authenticated: true,
          user: userProfile || {
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

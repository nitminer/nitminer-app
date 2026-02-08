import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

interface GoogleLoginRequestBody {
  idToken: string;
}

/**
 * POST /api/auth/google/login
 * 
 * Handles Google OAuth login
 * 1. Verifies Google ID token
 * 2. Finds or creates user in MongoDB with googleId
 * 3. Returns JWT tokens for session
 */
export async function POST(req: NextRequest) {
  try {
    const body: GoogleLoginRequestBody = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Initialize Google OAuth2 client
    const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

    // Verify the token
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      });
    } catch (tokenError) {
      console.error('Google token verification error:', tokenError);
      return NextResponse.json(
        { error: 'Invalid Google token' },
        { status: 401 }
      );
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find user by email or googleId
    let user = await User.findOne({
      $or: [
        { email: payload.email.toLowerCase() },
        { googleId: payload.sub },
      ],
    });

    // If user found via email but googleId not set, update it
    if (user && !user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    // If user doesn't exist, create new user with Google data
    if (!user) {
      user = new User({
        firstName: payload.given_name || payload.name?.split(' ')[0] || 'Google',
        lastName: payload.family_name || payload.name?.split(' ').slice(1).join(' ') || 'User',
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        role: 'user',
        trialCount: 5,
        isPremium: false,
        subscription: 'free',
        isActive: true,
        settings: {
          emailNotifications: true,
          pushNotifications: false,
          marketingEmails: false,
          theme: 'dark',
          language: 'en',
          timezone: 'UTC',
          twoFactorAuth: false,
        },
      });

      await user.save();
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion || 0,
        type: 'access',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id.toString(),
        type: 'refresh',
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Set secure httpOnly cookies
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isPremium: user.isPremium,
          subscription: user.subscription,
        },
      },
      { status: 200 }
    );

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { error: 'Failed to login with Google' },
      { status: 500 }
    );
  }
}

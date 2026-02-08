import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OTP from '@/models/OTP';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';

interface VerifyOTPRequestBody {
  email: string;
  otp: string;
}

/**
 * POST /api/auth/verify-otp
 * 
 * Verifies OTP and creates user account
 * 1. Validates OTP against stored record
 * 2. Checks OTP expiration
 * 3. Creates user in MongoDB using signup data
 * 4. Deletes OTP record after successful verification
 * 5. Returns JWT token for session
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: VerifyOTPRequestBody = await req.json();
    const { email, otp } = body;

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be a 6-digit number' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Find and validate OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      // Delete expired OTP
      await OTP.findByIdAndDelete(otpRecord._id);
      
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await User.findOne({
      email: email.toLowerCase(),
    });

    let clerkUserId = user?.clerkUserId || '';

    // If user doesn't exist, create it using signup data from OTP
    if (!user) {
      const signupData = otpRecord.signupData || {};
      
      // Validate required signup data
      if (!signupData.firstName || !signupData.lastName || !signupData.phone) {
        return NextResponse.json(
          { error: 'Incomplete signup data. Please sign up again.' },
          { status: 400 }
        );
      }

      // Create new user
      user = new User({
        firstName: signupData.firstName?.trim(),
        lastName: signupData.lastName?.trim(),
        email: email.toLowerCase(),
        phone: signupData.phone?.replace(/\D/g, ''),
        password: signupData.password || '',
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
      
      try {
        await user.save();
      } catch (userCreationError) {
        console.error('Error creating user:', userCreationError);
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }
    } else {
      // If user exists, just mark as active
      user.isActive = true;
    }

    // Update user - mark as email verified
    user.isActive = true;
    await user.save();

    // Delete the used OTP
    await OTP.findByIdAndDelete(otpRecord._id);

    // Generate JWT tokens if secret is available
    let accessToken = '';
    let refreshToken = '';
    
    if (process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET) {
      const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
      
      accessToken = jwt.sign(
        { 
          userId: user._id.toString(), 
          email: user.email, 
          role: user.role,
          tokenVersion: user.tokenVersion || 0,
          type: 'access',
        },
        secret,
        { expiresIn: '1h' }
      );
      
      refreshToken = jwt.sign(
        { 
          userId: user._id.toString(),
          tokenVersion: user.tokenVersion || 0,
          type: 'refresh',
        },
        secret,
        { expiresIn: '7d' }
      );
    }

    // Return success response with tokens
    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully. Your account is now active.',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        role: user.role,
        trialCount: user.trialCount,
      },
    }, { status: 200 });

    // Set cookies if tokens were generated
    if (accessToken && refreshToken) {
      response.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });

      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('OTP verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
    return NextResponse.json(
      { error: errorMessage || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
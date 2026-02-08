import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import OTP from '@/models/OTP';
import { sendOTP } from '@/lib/email';
import crypto from 'crypto';

interface ResendOTPRequestBody {
  email: string;
}

/**
 * POST /api/auth/resend-otp
 * 
 * Resends OTP to user's email
 * 1. Verifies user is authenticated via Clerk
 * 2. Validates email exists in user's Clerk account
 * 3. Generates new OTP and stores in MongoDB
 * 4. Sends OTP via email
 * 5. Returns new expiration time
 */
export async function POST(req: NextRequest) {
  try {
    // Verify Clerk authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign up first.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ResendOTPRequestBody = await req.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Verify user exists
    const user = await User.findOne({
      email: email.toLowerCase(),
      clerkUserId: userId,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Generate new OTP (6-digit numeric code)
    const newOtp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store new OTP in MongoDB
    const otpRecord = new OTP({
      email: email.toLowerCase(),
      otp: newOtp,
      expiresAt: otpExpiresAt,
    });

    await otpRecord.save();

    // Send OTP via email
    try {
      await sendOTP(email, newOtp);
    } catch (otpEmailError) {
      console.error('Failed to send OTP email:', otpEmailError);
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'OTP has been resent to your email address.',
      otpExpiresAt: otpExpiresAt,
      expiresIn: '10 minutes',
    }, { status: 200 });

  } catch (error) {
    console.error('Resend OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP';
    return NextResponse.json(
      { error: errorMessage || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

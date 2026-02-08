import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import OTP from '@/models/OTP';
import { sendWelcomeEmail, sendOTP } from '@/lib/email';
import crypto from 'crypto';

interface SignupRequestBody {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/**
 * POST /api/auth/signup
 * 
 * Clerk-based signup route:
 * 1. Verifies user is authenticated via Clerk
 * 2. Validates additional fields (firstName, lastName, phone)
 * 3. Checks if user already exists in MongoDB
 * 4. Creates user record with default settings
 * 5. Generates and sends OTP for verification
 * 6. Sends welcome email
 * 7. Returns user profile
 */
export async function POST(req: NextRequest) {
  try {
    // Verify Clerk authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign up with Clerk first.' },
        { status: 401 }
      );
    }

    // Parse request body for additional profile data
    const body: SignupRequestBody = await req.json();
    let { firstName, lastName, phone } = body;

    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'firstName, lastName, and phone are required' },
        { status: 400 }
      );
    }

    // Trim and validate inputs
    firstName = firstName.trim();
    lastName = lastName.trim();
    phone = phone.trim();

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'firstName and lastName cannot be empty' },
        { status: 400 }
      );
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    const cleanedPhone = phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      return NextResponse.json(
        { error: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Get Clerk user data to extract email
    const clerckUserResponse = await fetch(
      `https://api.clerk.com/v1/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }
    );

    if (!clerckUserResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Clerk user data' },
        { status: 400 }
      );
    }

    const clerkUser = await clerckUserResponse.json();
    const email = clerkUser.email_addresses?.[0]?.email_address;

    if (!email) {
      return NextResponse.json(
        { error: 'No email found in Clerk account' },
        { status: 400 }
      );
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists in our system. Please log in instead.' },
        { status: 409 }
      );
    }

    // Create user in MongoDB with default settings
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: cleanedPhone,
      clerkUserId: userId, // Store Clerk user ID for reference
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

    // Generate OTP (6-digit numeric code)
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in MongoDB
    const otpRecord = new OTP({
      email: email.toLowerCase(),
      otp,
      expiresAt: otpExpiresAt,
    });

    await otpRecord.save();

    // Send OTP via email
    try {
      await sendOTP(email, otp);
    } catch (otpEmailError) {
      console.error('Failed to send OTP email:', otpEmailError);
      // Don't fail signup for OTP email error
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(email, `${firstName} ${lastName}`);
    } catch (welcomeEmailError) {
      console.error('Failed to send welcome email:', welcomeEmailError);
      // Don't fail signup for welcome email error
    }

    // Return success response with user data
    return NextResponse.json({
      success: true,
      message: 'Signup successful. Please verify your email with the OTP sent to your email address.',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      otpRequired: true,
      otpExpiresAt: otpExpiresAt,
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete signup';
    return NextResponse.json(
      { error: errorMessage || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
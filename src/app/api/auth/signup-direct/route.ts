import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

interface SignupDirectRequestBody {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
}

/**
 * POST /api/auth/signup-direct
 * 
 * Direct signup endpoint for testing purposes (no OTP verification required)
 * 1. Validates all required fields
 * 2. Checks if user already exists
 * 3. Creates user account in MongoDB
 * 4. Returns user profile
 */
export async function POST(req: NextRequest) {
  try {
    const body: SignupDirectRequestBody = await req.json();
    const { email, firstName, lastName, phone, password } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase().split('@')[0] }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists. Please log in instead.' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      username: email.toLowerCase().split('@')[0], // Extract username from email
      phone: cleanedPhone,
      password, // Will be hashed by the pre-save hook
      verified: true, // Auto-verify for testing
      role: 'user',
      trialCount: 50000,
      isPremium: true,
      isActive: true,
    });

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Direct signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}

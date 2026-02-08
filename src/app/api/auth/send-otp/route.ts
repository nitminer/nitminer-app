import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OTP from '@/models/OTP';
import { User } from '@/models/User';
import { sendOTP } from '@/lib/email';

interface SendOTPRequestBody {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, phone, password } = await req.json() as SendOTPRequestBody;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists. Please log in instead.' },
        { status: 409 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP with signup data
    const otpDoc = new OTP({
      email: email.toLowerCase(),
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      signupData: {
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || '',
        password: password || '',
      },
    });

    await otpDoc.save();

    // Send OTP email
    await sendOTP(email, otp);

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
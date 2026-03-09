import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OTP from '@/models/OTP';
import { sendOTP } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Only allow admin email
    if (email !== 'admin@nitminer.com' && !email.endsWith('@nitw.ac.in')) {
      return NextResponse.json(
        { error: 'Invalid email for admin login' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Save new OTP  
    const otpDoc = new OTP({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await otpDoc.save();

    // Send OTP email to nitminer@nitw.ac.in for admin
    const adminEmail = email === 'admin@nitminer.com' ? 'nitminer@nitw.ac.in' : email;
    await sendOTP(adminEmail, otp);

    console.log(`[ADMIN-OTP] OTP sent to ${adminEmail}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to registered email',
      sentTo: adminEmail,
    });
  } catch (error) {
    console.error('Error sending admin OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

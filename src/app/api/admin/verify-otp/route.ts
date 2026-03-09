import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OTP from '@/models/OTP';
import { User } from '@/models/User';
import { SessionManagement } from '@/models/SessionManagement';

// Simple device fingerprint generation
function createDeviceFingerprint(deviceInfo: any): string {
  if (!deviceInfo) {
    return 'unknown-device';
  }

  const parts = [
    deviceInfo.userAgent || 'unknown',
    deviceInfo.platform || 'unknown',
    deviceInfo.language || 'unknown',
    deviceInfo.timezone || 'unknown',
  ];

  return Buffer.from(parts.join('|')).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp, deviceInfo } = await req.json();

    // Only allow admin email
    if (email !== 'admin@nitminer.com' && !email.endsWith('@nitw.ac.in')) {
      return NextResponse.json(
        { error: 'Invalid email for admin login' },
        { status: 400 }
      );
    }

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the OTP
    const otpDoc = await OTP.findOne({ email: { $in: [email, 'nitminer@nitw.ac.in'] } });

    if (!otpDoc || otpDoc.otp !== otp || otpDoc.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Delete the OTP
    await OTP.deleteOne({ _id: otpDoc._id });

    // Get or create admin user
    let admin = await User.findOne({ 
      email: 'admin@nitminer.com',
      role: 'admin'
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Check for multiple device logins
    const fingerprint = createDeviceFingerprint(deviceInfo);
    const existingSession = await SessionManagement.findOne({
      userId: admin._id,
      isActive: true,
    });

    const multipleDevices = existingSession && existingSession.deviceFingerprint !== fingerprint;

    console.log(`[ADMIN-OTP-VERIFY] Admin ${email} verified OTP. Multiple devices: ${multipleDevices}`);

    return NextResponse.json({
      success: true,
      message: 'OTP verified',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name || 'Administrator',
      },
      multipleDevices,
      existingSession: multipleDevices ? {
        deviceName: existingSession?.deviceName,
        browser: existingSession?.browser,
        os: existingSession?.os,
        loginTime: existingSession?.loginTime,
      } : null,
    });
  } catch (error) {
    console.error('Error verifying admin OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}

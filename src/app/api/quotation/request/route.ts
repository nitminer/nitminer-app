import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Quotation } from '@/models/Quotation';
import { User } from '@/models/User';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token || !token.email) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }

    await dbConnect();

    const {
      planName,
      planDuration,
      numberOfTools,
      estimatedPrice,
      additionalRequirements,
    } = await request.json();

    // Validate inputs
    if (!planName || !planDuration || !numberOfTools || estimatedPrice === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create quotation request
    const quotation = new Quotation({
      userId: user._id,
      userEmail: token.email,
      customerName: user.name || user.email,
      planName,
      planDuration,
      numberOfTools,
      estimatedPrice,
      additionalRequirements: additionalRequirements || '',
      status: 'pending',
    });

    await quotation.save();

    console.log('Quotation request created:', {
      id: quotation._id,
      userEmail: quotation.userEmail,
      planName: quotation.planName,
      numberOfTools: quotation.numberOfTools,
    });

    // Send email to admin
    try {
      const adminEmail = 'nitminer@nitw.ac.in';
      const emailContent = `
        <h2>New Quotation Request from ${user.firstName} ${user.lastName || ''}</h2>
        <p><strong>Customer Details:</strong></p>
        <ul>
          <li>Name: ${user.firstName} ${user.lastName || ''}</li>
          <li>Email: ${user.email}</li>
          <li>Phone: ${user.phone || 'Not provided'}</li>
        </ul>
        <p><strong>Quotation Details:</strong></p>
        <ul>
          <li>Plan: ${quotation.planName}</li>
          <li>Duration: ${quotation.planDuration}</li>
          <li>Number of Tools: ${quotation.numberOfTools}</li>
          <li>Estimated Price: ₹${(quotation.estimatedPrice / 100).toLocaleString('en-IN')}</li>
          <li>Requirements: ${quotation.additionalRequirements || 'None'}</li>
        </ul>
        <p><a href="https://nitminer.com/admin/dashboard?tab=quotations" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Admin Dashboard</a></p>
      `;

      console.log('Sending admin notification email to:', adminEmail);
      console.log('Email subject:', `🚨 ALERT: Quotation Request from ${user.firstName}`);

      await sendEmail({
        to: adminEmail,
        subject: `🚨 ALERT: Quotation Request from ${user.firstName}`,
        html: emailContent,
      });

      console.log('Admin notification sent successfully to:', adminEmail);
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError);
      console.error('Error details:', {
        message: emailError instanceof Error ? emailError.message : String(emailError),
        stack: emailError instanceof Error ? emailError.stack : undefined,
      });
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Quotation request submitted successfully',
        quotation: {
          _id: quotation._id,
          planName: quotation.planName,
          planDuration: quotation.planDuration,
          numberOfTools: quotation.numberOfTools,
          estimatedPrice: quotation.estimatedPrice,
          status: quotation.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating quotation request:', error);
    return NextResponse.json(
      { error: 'Failed to submit quotation request' },
      { status: 500 }
    );
  }
}

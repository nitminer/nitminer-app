import nodemailer from 'nodemailer';

// Configure your email service here
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendSubscriptionExpiredEmail(email: string, name: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your Subscription Has Expired',
      html: `
        <h1>Hello ${name},</h1>
        <p>Your premium subscription has expired. Please renew to continue using our tools without limitations.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_API_URL}/pricing" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Renew Now
          </a>
        </p>
        <p>If you have any questions, please contact our support team.</p>
      `,
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Welcome to TrustInn!',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for joining TrustInn. You now have 5 free trials to explore our tools.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_API_URL}/tools" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Start Using Tools
          </a>
        </p>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendOTP(email: string, otp: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your OTP Code - NITMiner Technologies',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Your OTP Code</h1>
          <p>Hello,</p>
          <p>Your one-time password (OTP) for verification is:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h2 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h2>
          </div>
          <p>This code will expire in 10 minutes. Please do not share this code with anyone.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            © 2026 NITMiner Technologies. All rights reserved.
          </p>
        </div>
      `,
    });
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw error;
  }
}

export async function sendPaymentSuccessEmail(
  email: string,
  name: string,
  amount: number,
  plan: string,
  receiptUrl?: string,
  subscriptionEndDate?: string,
  transactionId?: string,
  paymentMethod?: string
) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Payment Successful & Subscription Activated - NITMiner Technologies',
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Payment Successful</h1>
          </div>

          <!-- Content -->
          <div style="background: white; padding: 30px;">
            <p style="color: #333; font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Thank you for your payment! Your premium subscription has been successfully activated. You now have full access to all our tools and features.
            </p>

            <!-- Order Details Card -->
            <div style="background: #f8f9fa; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 4px; margin: 25px 0;">
              <h3 style="color: #333; margin-top: 0; font-size: 16px;">Order Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Plan:</strong></td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${plan}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Amount Paid:</strong></td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">₹${amount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Payment Method:</strong></td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${paymentMethod || 'Online Payment'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Payment Status:</strong></td>
                  <td style="padding: 8px 0; color: #28a745; font-size: 14px; text-align: right;"><strong>Completed</strong></td>
                </tr>
                ${transactionId ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Transaction ID:</strong></td>
                  <td style="padding: 8px 0; color: #333; font-size: 13px; text-align: right; word-break: break-all;">${transactionId}</td>
                </tr>
                ` : ''}
                ${subscriptionEndDate ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Subscription Valid Till:</strong></td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${subscriptionEndDate}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <!-- CTA Buttons -->
            <div style="margin: 30px 0; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_API_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
                Go to Dashboard
              </a>
              ${receiptUrl ? `
              <a href="${receiptUrl}" style="display: inline-block; background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                📥 Download Receipt
              </a>
              ` : ''}
            </div>

            <!-- Support Info -->
            <div style="background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 5px; margin: 25px 0;">
              <h4 style="color: #3b82f6; margin-top: 0; font-size: 14px;">Need Help?</h4>
              <p style="color: #666; font-size: 13px; margin: 0;">
                If you have any questions or need support, please contact us at <strong>support@nitminer.com</strong> or reply to this email.
              </p>
            </div>

            <!-- Footer -->
            <p style="color: #999; font-size: 12px; margin: 25px 0 0 0; padding-top: 15px; border-top: 1px solid #e0e0e0;">
              This is an automated email. Please do not reply directly. For support, contact our team.
            </p>
          </div>

          <!-- Copyright -->
          <div style="background: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 11px; color: #999;">
            <p style="margin: 0;">
              © 2026 NITMiner Technologies Pvt Ltd. All rights reserved.<br>
              📧 support@nitminer.com | 🌐 www.nitminer.com
            </p>
          </div>
        </div>
      `,
    });
    console.log(`Payment confirmation sent to ${email}`);
  } catch (error) {
    console.error('Failed to send payment success email:', error);
    throw error;
  }
}

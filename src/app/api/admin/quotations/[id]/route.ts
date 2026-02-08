import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Quotation } from '@/models/Quotation';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    // Check admin role
    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    let quotationId, pdfUrl, fileName, adminNotes;
    
    // Handle both JSON and FormData
    const contentType = request.headers.get('content-type') || '';
    console.log('Request content-type:', contentType);
    
    try {
      if (contentType.includes('application/json')) {
        const body = await request.json();
        console.log('Parsed JSON body:', { quotationId: body.quotationId, pdfUrl: body.pdfUrl, fileName: body.fileName });
        quotationId = body.quotationId;
        pdfUrl = body.pdfUrl;
        fileName = body.fileName;
        adminNotes = body.adminNotes;
      } else {
        const formData = await request.formData();
        quotationId = formData.get('quotationId') as string;
        pdfUrl = formData.get('pdfUrl') as string;
        fileName = formData.get('fileName') as string;
        adminNotes = formData.get('adminNotes') as string;
      }
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body', details: String(parseError) },
        { status: 400 }
      );
    }

    console.log('Extracted values:', { quotationId, pdfUrl, fileName, adminNotes });

    // Validate pdfUrl format
    if (pdfUrl && typeof pdfUrl === 'string') {
      pdfUrl = pdfUrl.trim();
    }

    if (!quotationId || !quotationId.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields', missing: { quotationId: true, pdfUrl: false } },
        { status: 400 }
      );
    }

    if (!pdfUrl || !pdfUrl.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields', missing: { quotationId: false, pdfUrl: true } },
        { status: 400 }
      );
    }

    // Update quotation with PDF
    const quotation = await Quotation.findByIdAndUpdate(
      quotationId,
      {
        quotationPdfUrl: pdfUrl,
        quotationFileName: fileName || 'quotation.pdf',
        status: 'quotation_sent',
        adminNotes: adminNotes || '',
      },
      { new: true }
    );

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    console.log('Quotation PDF uploaded:', {
      quotationId,
      fileName,
      userEmail: quotation.userEmail,
    });

    // Send email to user with quotation
    try {
      const emailContent = `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📄 Your TrustInn Tool Quotation</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 14px;">Quotation Request Processed</p>
          </div>

          <!-- Content -->
          <div style="background: white; padding: 40px 30px;">
            <p style="color: #333; font-size: 16px; margin-top: 0;">Hello <strong>${quotation.customerName}</strong>,</p>

            <p style="color: #666; font-size: 15px; line-height: 1.8; margin: 20px 0;">
              We are delighted to inform you that your requested <strong>TrustInn Tool Quotation</strong> has been prepared and is now ready for your review. Our team has carefully prepared a custom quotation based on your requirements.
            </p>

            <!-- Quotation Details Card -->
            <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e8ecff 100%); border-left: 4px solid #3b82f6; padding: 25px; border-radius: 6px; margin: 30px 0;">
              <h3 style="color: #1e40af; margin-top: 0; font-size: 16px; font-weight: bold;">📋 Quotation Summary</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr style="border-bottom: 1px solid #d0d9ff;">
                  <td style="padding: 12px 0; color: #475569; font-size: 14px; font-weight: 500;">Plan Type:</td>
                  <td style="padding: 12px 0; color: #1e40af; font-size: 14px; font-weight: bold; text-align: right;">${quotation.planName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #d0d9ff;">
                  <td style="padding: 12px 0; color: #475569; font-size: 14px; font-weight: 500;">Duration:</td>
                  <td style="padding: 12px 0; color: #333; font-size: 14px; text-align: right;">${quotation.planDuration}</td>
                </tr>
                <tr style="border-bottom: 1px solid #d0d9ff;">
                  <td style="padding: 12px 0; color: #475569; font-size: 14px; font-weight: 500;">Number of Tools:</td>
                  <td style="padding: 12px 0; color: #333; font-size: 14px; text-align: right;">${quotation.numberOfTools}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #475569; font-size: 14px; font-weight: 500;">Estimated Price:</td>
                  <td style="padding: 12px 0; color: #059669; font-size: 16px; font-weight: bold; text-align: right;">₹${(quotation.estimatedPrice / 100).toLocaleString('en-IN')}</td>
                </tr>
              </table>
              ${quotation.adminNotes ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #d0d9ff;">
                <p style="color: #475569; font-size: 13px; margin: 0 0 8px 0;"><strong>Additional Notes:</strong></p>
                <p style="color: #333; font-size: 13px; margin: 0; line-height: 1.6;">${quotation.adminNotes.replace(/\n/g, '<br>')}</p>
              </div>
              ` : ''}
            </div>

            <!-- CTA Button -->
            <div style="margin: 35px 0; text-align: center;">
              <p style="color: #666; font-size: 14px; margin: 0 0 15px 0;">Download and review your detailed quotation:</p>
              <a href="${pdfUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
                📥 View & Download Quotation
              </a>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.8; margin: 30px 0;">
              This quotation is valid for <strong>30 days</strong> from the date of this email. If you have any questions or would like to discuss the details, please don't hesitate to reach out to our team.
            </p>

            <!-- Support Info -->
            <div style="background: #fef3c7; border: 1px solid #fcd34d; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 30px 0;">
              <h4 style="color: #d97706; margin-top: 0; font-size: 14px; font-weight: bold;">💬 Need Assistance?</h4>
              <p style="color: #92400e; font-size: 13px; margin: 8px 0 0 0; line-height: 1.6;">
                Our support team is here to help! If you have any questions about this quotation or need clarification, please contact us at <strong>support@nitminer.com</strong> or reply directly to this email.
              </p>
            </div>

            <!-- Footer -->
            <p style="color: #999; font-size: 13px; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Thank you for choosing TrustInn! We look forward to working with you.
            </p>
          </div>

          <!-- Copyright -->
          <div style="background: #1f2937; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 11px; color: #9ca3af;">
            <p style="margin: 0; line-height: 1.6;">
              © 2026 NITMiner Technologies Pvt Ltd. All rights reserved.<br>
              <strong>TrustInn</strong> - Your Partner in Digital Excellence<br>
              📧 support@nitminer.com | 🌐 www.nitminer.com
            </p>
          </div>
        </div>
      `;

      await sendEmail({
        to: quotation.userEmail,
        subject: `Your TrustInn Tool Quotation for ${quotation.planName} Plan is Ready`,
        html: emailContent,
      });

      console.log('User notification sent successfully to:', quotation.userEmail);
    } catch (emailError) {
      console.error('Error sending user notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Quotation PDF uploaded successfully',
        quotation: {
          _id: quotation._id,
          status: quotation.status,
          quotationPdfUrl: quotation.quotationPdfUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading quotation PDF:', error);
    return NextResponse.json(
      { error: 'Failed to upload quotation PDF' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    // Check admin role
    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { quotationId, status, adminNotes } = await request.json();

    if (!quotationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'quotation_sent', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update quotation status
    const quotation = await Quotation.findByIdAndUpdate(
      quotationId,
      {
        status,
        adminNotes: adminNotes || '',
      },
      { new: true }
    );

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    console.log('Quotation status updated:', {
      quotationId,
      status: quotation.status,
      userEmail: quotation.userEmail,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Quotation status updated',
        quotation: {
          _id: quotation._id,
          status: quotation.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating quotation:', error);
    return NextResponse.json(
      { error: 'Failed to update quotation' },
      { status: 500 }
    );
  }
}

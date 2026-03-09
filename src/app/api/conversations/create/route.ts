import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Conversation } from '@/models/Conversation';
import { User } from '@/models/User';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { subject, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create conversation
    const conversation = new Conversation({
      userId: user._id,
      userEmail: session.user.email,
      subject,
      status: 'open',
      lastMessage: message,
      lastMessageAt: new Date(),
      messageCount: 1,
      unreadByAdmin: 1,
      unreadByUser: 0,
    });

    await conversation.save();

    // Create initial message
    const ConversationMessage = require('@/models/ConversationMessage').ConversationMessage;
    const messageDoc = new ConversationMessage({
      conversationId: conversation._id,
      senderId: user._id,
      senderEmail: session.user.email,
      senderName: user.firstName || user.email,
      senderRole: 'user',
      message,
      read: false,
    });

    await messageDoc.save();

    console.log('New conversation created:', {
      id: conversation._id,
      userEmail: session.user.email,
      subject,
    });

    // Send email to admin
    try {
      const adminEmail = 'nitminer@nitw.ac.in';
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      
      const emailContent = `
        <h2>New Message from ${userName}</h2>
        <p><strong>From:</strong> ${user.firstName} ${user.lastName || ''}</p>
        <p><strong>Email:</strong> ${session.user.email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p><a href="https://nitminer.com/admin/dashboard?tab=inbox" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reply in Admin Dashboard</a></p>
      `;

      await sendEmail({
        to: adminEmail,
        subject: `New Message from ${userName}`,
        html: emailContent,
      });

      console.log('Admin notification sent successfully');
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        conversation: {
          _id: conversation._id,
          subject: conversation.subject,
          status: conversation.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

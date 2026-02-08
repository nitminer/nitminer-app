import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { ConversationMessage } from '@/models/ConversationMessage';
import { Conversation } from '@/models/Conversation';
import { User } from '@/models/User';
import { sendEmail } from '@/lib/email';

/**
 * GET /api/conversations/[id]/messages
 * Get messages for a specific conversation
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const { id } = await params;

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (token.role !== 'admin' && conversation.userEmail !== token.email) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const messages = await ConversationMessage.find({ conversationId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ConversationMessage.countDocuments({ conversationId: id });

    return NextResponse.json(
      {
        success: true,
        data: messages.reverse(), // Reverse to show chronological order
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Send a message in a conversation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (token.role !== 'admin' && conversation.userEmail !== token.email) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Create and save message
    const conversationMessage = new ConversationMessage({
      conversationId: id,
      senderId: token.id,
      senderEmail: token.email,
      senderName: token.name || 'User',
      senderRole: token.role || 'user',
      message: message.trim(),
      read: false,
    });

    await conversationMessage.save();

    // Update conversation
    conversation.lastMessage = message;
    conversation.lastMessageAt = new Date();
    conversation.messageCount = (conversation.messageCount || 0) + 1;
    
    if (token.role === 'admin') {
      conversation.unreadByUser = (conversation.unreadByUser || 0) + 1;
    } else {
      conversation.unreadByAdmin = (conversation.unreadByAdmin || 0) + 1;
    }

    await conversation.save();

    // Send email notification
    try {
      if (token.role === 'admin') {
        // Admin sent message, notify user
        const emailContent = `
          <h2>New Message from Support Team</h2>
          <p><strong>Subject:</strong> ${conversation.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <p><a href="https://nitminer.com/dashboard?tab=inbox" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reply in Dashboard</a></p>
        `;

        await sendEmail({
          to: conversation.userEmail,
          subject: `New Reply: ${conversation.subject}`,
          html: emailContent,
        });
      } else {
        // User sent message, notify admin
        const user = await User.findOne({ email: token.email });
        const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : token.email;
        
        const adminEmail = 'nitminer@nitw.ac.in';
        const emailContent = `
          <h2>New Message from ${userName}</h2>
          <p><strong>Subject:</strong> ${conversation.subject}</p>
          <p><strong>From:</strong> ${userName} (${token.email})</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <p><a href="https://nitminer.com/admin/dashboard?tab=inbox" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reply in Admin Dashboard</a></p>
        `;

        await sendEmail({
          to: adminEmail,
          subject: `New Message from ${userName}`,
          html: emailContent,
        });
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        data: conversationMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

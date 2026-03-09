import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { Conversation } from '@/models/Conversation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!['open', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await dbConnect();

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check access control - user can only close their own, admin can close any
    if (session.user.role !== 'admin' && conversation.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    conversation.status = status;
    conversation.updatedAt = new Date();
    await conversation.save();

    return NextResponse.json({
      message: 'Conversation updated successfully',
      data: conversation,
    });
  } catch (error) {
    console.error('Conversation PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await dbConnect();

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check access control
    if (session.user.role !== 'admin' && conversation.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      data: conversation,
    });
  } catch (error) {
    console.error('Conversation GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

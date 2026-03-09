import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';

/**
 * GET /api/auth/session
 * Returns current session information from NitMiner backend
 * 
 * This is the main session endpoint for NitMiner
 * TrustInn also has its own session endpoint at trustinn.nitminer.com/api/auth/session
 * 
 * Query parameters:
 * - userId: User ID to fetch session for
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const email = request.nextUrl.searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json(
        {
          isAuthenticated: false,
          message: 'No userId or email provided'
        },
        { status: 200 }
      );
    }

    await dbConnect();

    // Get user data
    const query = userId ? { _id: userId } : { email };
    const user = await User.findOne(query).select(
      'name email role isPremium trialCount subscription isEmailVerified emailLowercase'
    );

    if (!user) {
      return NextResponse.json(
        {
          isAuthenticated: false,
          message: 'User not found'
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        isAuthenticated: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isPremium: user.isPremium,
          trialCount: user.trialCount,
          isEmailVerified: user.isEmailVerified,
          subscription: user.subscription
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/auth/session] Error:', error);
    return NextResponse.json(
      {
        isAuthenticated: false,
        error: 'Failed to retrieve session'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/session
 * Validates and returns session information
 * 
 * Request body:
 * {
 *   "userId": "user_id" | "email": "user@example.com"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json(
        {
          isAuthenticated: false,
          message: 'User ID or email required'
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get user data
    const query = userId ? { _id: userId } : { email };
    const user = await User.findOne(query).select(
      'name email role isPremium trialCount subscription isEmailVerified'
    );

    if (!user) {
      return NextResponse.json(
        {
          isAuthenticated: false,
          message: 'User session invalid'
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        isAuthenticated: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isPremium: user.isPremium,
          trialCount: user.trialCount,
          isEmailVerified: user.isEmailVerified,
          subscription: user.subscription
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/auth/session] Error:', error);
    return NextResponse.json(
      {
        isAuthenticated: false,
        error: 'Failed to validate session'
      },
      { status: 500 }
    );
  }
}

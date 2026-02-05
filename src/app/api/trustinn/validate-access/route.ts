import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';

/**
 * POST /api/trustinn/validate-access
 * 
 * Validates TrustInn user access and checks trial/premium status
 * Called by TrustInn application every 5 executions
 * 
 * Expected headers:
 * - Authorization: Bearer <jwt_token>
 * - X-Request-Token: <jwt_token> (alternative)
 * 
 * Request body:
 * {
 *   "executionCount": 5,  // Number of executions completed
 *   "userId": "user_id"   // Optional: for additional verification
 * }
 * 
 * Response:
 * {
 *   "allowed": true/false,
 *   "hasPremium": true/false,
 *   "remainingTrials": 3,
 *   "message": "Access granted" or error message,
 *   "trialsUpdated": true
 * }
 */

export async function POST(req: NextRequest) {
  try {
    // Get JWT token from Authorization header or query params
    let token =
      req.headers.get('Authorization')?.replace('Bearer ', '') ||
      req.headers.get('X-Request-Token') ||
      req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          allowed: false,
          message: 'No authentication token provided',
          code: 'MISSING_TOKEN',
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret');
    } catch (error) {
      return NextResponse.json(
        {
          allowed: false,
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN',
        },
        { status: 401 }
      );
    }

    const userId = decodedToken.id || decodedToken.sub;

    if (!userId) {
      return NextResponse.json(
        {
          allowed: false,
          message: 'Invalid token: missing user ID',
          code: 'INVALID_TOKEN_FORMAT',
        },
        { status: 401 }
      );
    }

    await dbConnect();

    // Validate if the ID is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          allowed: false,
          message: 'Invalid user ID format',
          code: 'INVALID_USER_ID',
        },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json(
        {
          allowed: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const executionCount = body.executionCount || 1;

    // Check premium status
    const hasPremium = user.isPremium;
    let remainingTrials = user.trialCount || 0;
    let allowed = false;
    let trialsUpdated = false;
    let message = '';

    // Access logic
    if (hasPremium) {
      // Premium users have unlimited access
      allowed = true;
      message = 'Access granted - Premium user';
    } else if (remainingTrials > 0) {
      // Free users with trials remaining
      allowed = true;

      // Only decrement trials every 5 executions (checkpoint)
      if (executionCount >= 5) {
        const newTrialCount = Math.max(0, remainingTrials - 1);

        await User.findByIdAndUpdate(userId, {
          trialCount: newTrialCount,
        });

        remainingTrials = newTrialCount;
        trialsUpdated = true;
        message = `Access granted - Trial used (${newTrialCount} remaining)`;
      } else {
        message = `Access granted - ${remainingTrials} trials remaining`;
      }
    } else {
      // No premium and no trials
      allowed = false;
      message = 'No trials left - Please upgrade to premium';
    }

    // Log access attempt (optional - for analytics)
    console.log(`[TrustInn Access] User: ${user.email}, Premium: ${hasPremium}, Trials: ${remainingTrials}, Allowed: ${allowed}`);

    return NextResponse.json(
      {
        allowed,
        hasPremium,
        remainingTrials,
        message,
        trialsUpdated,
        userData: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: allowed ? 200 : 403 }
    );
  } catch (error) {
    console.error('TrustInn access validation error:', error);
    return NextResponse.json(
      {
        allowed: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trustinn/validate-access
 * 
 * Health check endpoint for TrustInn
 * Returns basic validation endpoint info
 */
export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      status: 'active',
      message: 'TrustInn validation endpoint is operational',
      version: '1.0.0',
    },
    { status: 200 }
  );
}

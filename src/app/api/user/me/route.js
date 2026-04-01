import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Payment from '@/models/Payment';

async function getLatestPayment(user) {
  try {
    if (!user?.email) return null;

    const payment = await Payment.findOne({
      userEmail: String(user.email).toLowerCase(),
      status: 'success',
    })
      .sort({ completedAt: -1, createdAt: -1 })
      .lean();

    if (!payment) return null;

    return {
      id: String(payment._id || ''),
      planName: payment.planName || payment.plan || '',
      planDuration: payment.plan || '',
      amount: Number(payment.amount || 0),
      completedAt: payment.completedAt || payment.createdAt || null,
    };
  } catch {
    return null;
  }
}

function buildSessionFallbackUser(sessionUser) {
  return {
    name:
      sessionUser.name ||
      sessionUser.firstName ||
      String(sessionUser.email || 'User').split('@')[0],
    email: sessionUser.email,
    role: sessionUser.role || 'user',
    isPremium: Boolean(sessionUser.isPremium),
    trialCount: Number(sessionUser.trialCount || 0),
    subscriptionExpiry: sessionUser.subscriptionExpiry || null,
    subscription: sessionUser.subscription || null,
  };
}

async function getUserPayload() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;

  if (!sessionUser?.email) {
    return { error: 'Unauthorized', status: 401 };
  }

  try {
    await dbConnect();
    const dbUser = await User.findOne({
      email: String(sessionUser.email).toLowerCase(),
    }).lean();

    const mergedUser = dbUser
      ? {
          name:
            dbUser.name ||
            dbUser.firstName ||
            sessionUser.name ||
            String(sessionUser.email).split('@')[0],
          email: dbUser.email || sessionUser.email,
          role: dbUser.role || sessionUser.role || 'user',
          isPremium: Boolean(
            typeof dbUser.isPremium === 'boolean'
              ? dbUser.isPremium
              : sessionUser.isPremium
          ),
          trialCount: Number(
            typeof dbUser.trialCount === 'number'
              ? dbUser.trialCount
              : sessionUser.trialCount || 0
          ),
          subscriptionExpiry:
            dbUser.subscriptionExpiry || sessionUser.subscriptionExpiry || null,
          subscription: dbUser.subscription || sessionUser.subscription || null,
        }
      : buildSessionFallbackUser(sessionUser);

    const latestPayment = await getLatestPayment(mergedUser);
    return { user: mergedUser, latestPayment, status: 200 };
  } catch {
    // DB unavailable fallback: still return session user so dashboard works.
    return {
      user: buildSessionFallbackUser(sessionUser),
      latestPayment: null,
      status: 200,
    };
  }
}

export async function GET() {
  const result = await getUserPayload();
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(
    { user: result.user, latestPayment: result.latestPayment },
    { status: result.status }
  );
}

export async function POST() {
  // Keep same behavior as GET so Profile "Refresh" works.
  return GET();
}


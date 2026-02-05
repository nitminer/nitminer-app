import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import { SystemSettings } from '@/models/SystemSettings';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = await SystemSettings.create({});
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { freeTrialsEnabled, pricing } = await req.json();

    await dbConnect();

    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = await SystemSettings.create({
        freeTrialsEnabled,
        pricing,
      });
    } else {
      if (freeTrialsEnabled !== undefined) settings.freeTrialsEnabled = freeTrialsEnabled;
      if (pricing) {
        settings.pricing = {
          sixMonths: pricing.sixMonths || settings.pricing.sixMonths,
          twelveMonths: pricing.twelveMonths || settings.pricing.twelveMonths,
        };
      }
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

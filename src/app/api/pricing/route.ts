import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SystemSettings } from '@/models/SystemSettings';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Fetch pricing settings from database
    const settings = await SystemSettings.findOne().lean();

    if (!settings || !settings.pricing) {
      // Return default pricing plans
      return NextResponse.json({
        plans: [
          {
            _id: '1',
            planName: 'free',
            displayName: 'Free',
            description: 'Perfect for getting started',
            monthlyPrice: 0,
            sixMonthPrice: 0,
            yearlyPrice: 0,
            trialDays: 30,
            trialExecutions: 5,
            executionsPerMonth: 5,
            storageGB: 1,
            supportLevel: 'Community',
            features: [
              { name: 'Basic Features', included: true },
              { name: 'Community Support', included: true },
              { name: 'Limited Storage', included: true },
              { name: 'Priority Support', included: false },
              { name: 'Advanced Analytics', included: false },
            ],
            toolsIncluded: [
              { name: 'Basic Tools', available: true },
              { name: 'Advanced Tools', available: false },
            ],
            isActive: true,
            displayOrder: 1,
            color: 'slate',
            badge: null,
          },
          {
            _id: '2',
            planName: 'pro',
            displayName: 'Pro',
            description: 'For growing teams',
            monthlyPrice: 1,
            sixMonthPrice: 50,
            yearlyPrice: 100,
            trialDays: 30,
            trialExecutions: 50,
            executionsPerMonth: -1, // Unlimited
            storageGB: 100,
            supportLevel: 'Priority',
            features: [
              { name: 'All Basic Features', included: true },
              { name: 'Priority Support', included: true },
              { name: 'Advanced Analytics', included: true },
              { name: 'Unlimited Executions', included: true },
              { name: 'Custom Integrations', included: false },
              { name: 'Dedicated Account Manager', included: false },
            ],
            toolsIncluded: [
              { name: 'Basic Tools', available: true },
              { name: 'Advanced Tools', available: true },
              { name: 'Enterprise Tools', available: false },
            ],
            isActive: true,
            displayOrder: 2,
            color: 'blue',
            badge: 'Most Popular',
          },
          {
            _id: '3',
            planName: 'enterprise',
            displayName: 'Enterprise',
            description: 'For large organizations',
            monthlyPrice: 50,
            sixMonthPrice: 250,
            yearlyPrice: 500,
            trialDays: 30,
            trialExecutions: 500,
            executionsPerMonth: -1, // Unlimited
            storageGB: 1000,
            supportLevel: 'Dedicated',
            features: [
              { name: 'All Pro Features', included: true },
              { name: 'Dedicated Account Manager', included: true },
              { name: 'Custom Integrations', included: true },
              { name: 'SLA Guarantee', included: true },
              { name: '24/7 Phone Support', included: true },
              { name: 'Unlimited Executions', included: true },
            ],
            toolsIncluded: [
              { name: 'Basic Tools', available: true },
              { name: 'Advanced Tools', available: true },
              { name: 'Enterprise Tools', available: true },
            ],
            isActive: true,
            displayOrder: 3,
            color: 'purple',
            badge: 'Premium',
          },
        ],
      });
    }

    // Return pricing from database
    return NextResponse.json({
      plans: settings.pricing || [],
    });
  } catch (error) {
    console.error('Pricing fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing plans' },
      { status: 500 }
    );
  }
}

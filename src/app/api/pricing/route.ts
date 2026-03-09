import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SystemSettings } from '@/models/SystemSettings';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Fetch pricing settings from database
    const settings = await SystemSettings.findOne().lean();

    if (!settings || !settings.pricing) {
      // Return default pricing plans with new structure
      return NextResponse.json({
        plans: [
          {
            _id: 'free_trials',
            planName: 'free_trials',
            displayName: '5 Free Trials',
            description: '5 free trial executions for 2 years access to all 10 analysis tools',
            monthlyPrice: 0,
            sixMonthPrice: 0,
            yearlyPrice: 0,
            trialDays: 730, // 2 years
            trialExecutions: 5,
            executionsPerMonth: 5,
            storageGB: 2,
            supportLevel: 'Basic',
            features: [
              { name: 'Access to all 10 tools', included: true },
              { name: '5 Free Trial Executions', included: true },
              { name: '2 Years Access', included: true },
              { name: 'Python Analyzer', included: true },
              { name: 'Basic Support', included: true },
            ],
            toolsIncluded: [],
            isActive: true,
            displayOrder: 1,
            color: 'green',
            badge: 'Free Trial',
          },
          {
            _id: 'standard',
            planName: 'standard',
            displayName: 'Standard Plan',
            description: 'Access to all 10 advanced analysis tools for comprehensive code testing and verification.',
            monthlyPrice: 0,
            sixMonthPrice: 0,
            yearlyPrice: 5000,
            twoYearPrice: 10000,
            trialDays: 0,
            trialExecutions: 0,
            executionsPerMonth: -1, // Unlimited
            storageGB: 100,
            supportLevel: 'Priority',
            features: [
              { name: 'All 10 Analysis Tools', included: true },
              { name: 'C Tools (6)', included: true },
              { name: 'Java Tools (1)', included: true },
              { name: 'Python Tools (1)', included: true },
              { name: 'Blockchain Tools (1)', included: true },
              { name: 'Priority Support', included: true },
              { name: 'Unlimited Executions', included: true },
              { name: 'Advanced Analytics', included: true },
            ],
            toolsIncluded: [],
            isActive: true,
            displayOrder: 2,
            color: 'blue',
            badge: 'Most Popular',
          },
          {
            _id: 'premium_single_user',
            planName: 'premium_single_user',
            displayName: 'Premium Single User',
            description: 'Exclusive premium access for individual users only. Not shareable with others.',
            monthlyPrice: 0,
            sixMonthPrice: 0,
            yearlyPrice: 5000,
            twoYearPrice: 10000,
            trialDays: 0,
            trialExecutions: 0,
            executionsPerMonth: -1, // Unlimited
            storageGB: 250,
            supportLevel: 'Dedicated',
            singleUserOnly: true, // Only the purchaser can access
            features: [
              { name: 'All 10 Analysis Tools', included: true },
              { name: 'Exclusive Personal Access', included: true },
              { name: 'Not Shareable', included: true },
              { name: 'Dedicated Support', included: true },
              { name: 'Unlimited Executions', included: true },
              { name: 'Custom Integrations', included: true },
              { name: 'Extended Storage (250GB)', included: true },
              { name: 'Priority Feature Access', included: true },
            ],
            toolsIncluded: [],
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

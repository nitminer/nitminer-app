import mongoose from 'mongoose';
import Pricing from './Pricing.js';
import connectDB from '../lib/mongodb.js';

const pricingPlans = [
  {
    planName: 'free',
    displayName: 'Free Plan',
    description: 'Perfect for getting started with our tools',
    price: 0,
    currency: 'INR',
    billingPeriod: 'free',
    unlimitedAccess: false,
    toolsIncluded: [
      'PDF Analyzer',
      'Image Processor',
      'Code Formatter',
      'JSON Validator'
    ],
    supportingLanguages: [
      'en',
      'hi',
      'es',
      'fr',
      'de'
    ],
    features: {
      monthlyScans: 10,
      apiCalls: 100,
      storageGB: 1,
      supportLevel: 'community',
      customReports: false,
      teamMembers: 1
    },
    benefits: [
      {
        icon: '⚡',
        title: 'Basic Tools',
        description: '4 essential tools to get started'
      },
      {
        icon: '📊',
        title: 'Limited Scans',
        description: '10 scans per month'
      },
      {
        icon: '🌐',
        title: 'Community Support',
        description: 'Help from community forums'
      },
      {
        icon: '📱',
        title: 'Mobile Access',
        description: 'Access on all devices'
      }
    ],
    isActive: true,
    displayOrder: 1
  },
  {
    planName: 'premium_6m',
    displayName: '6 Months Premium',
    description: 'Unlock more power for 6 months',
    price: 10,
    currency: 'INR',
    billingPeriod: '6-months',
    unlimitedAccess: true,
    toolsIncluded: [
      'PDF Analyzer',
      'Image Processor',
      'Code Formatter',
      'JSON Validator',
      'Database Manager',
      'API Tester',
      'Text Converter',
      'File Compression'
    ],
    supportingLanguages: [
      'en',
      'hi',
      'es',
      'fr',
      'de',
      'zh',
      'ja',
      'pt'
    ],
    features: {
      monthlyScans: 500,
      apiCalls: 10000,
      storageGB: 50,
      supportLevel: 'email',
      customReports: true,
      teamMembers: 5
    },
    benefits: [
      {
        icon: '🚀',
        title: 'Unlimited Access',
        description: 'All tools at your fingertips'
      },
      {
        icon: '📈',
        title: 'Advanced Features',
        description: 'Custom reports & analytics'
      },
      {
        icon: '✉️',
        title: 'Email Support',
        description: 'Dedicated support team'
      },
      {
        icon: '👥',
        title: 'Team Collaboration',
        description: 'Up to 5 team members'
      },
      {
        icon: '💾',
        title: 'Large Storage',
        description: '50 GB cloud storage'
      },
      {
        icon: '🔒',
        title: 'Priority Security',
        description: 'Enhanced data protection'
      }
    ],
    isActive: true,
    displayOrder: 2
  },
  {
    planName: 'premium_12m',
    displayName: '12 Months Premium',
    description: 'Best value - Full year access',
    price: 15,
    currency: 'INR',
    billingPeriod: '12-months',
    unlimitedAccess: true,
    toolsIncluded: [
      'PDF Analyzer',
      'Image Processor',
      'Code Formatter',
      'JSON Validator',
      'Database Manager',
      'API Tester',
      'Text Converter',
      'File Compression',
      'Video Editor',
      'Audio Processor',
      'Chart Generator',
      'Code Documentation Generator'
    ],
    supportingLanguages: [
      'en',
      'hi',
      'es',
      'fr',
      'de',
      'zh',
      'ja',
      'pt',
      'ru',
      'ar',
      'ko'
    ],
    features: {
      monthlyScans: 999999,
      apiCalls: 999999,
      storageGB: 500,
      supportLevel: 'priority',
      customReports: true,
      teamMembers: 20
    },
    benefits: [
      {
        icon: '⭐',
        title: 'Everything Included',
        description: 'All 12 premium tools'
      },
      {
        icon: '♾️',
        title: 'Unlimited Everything',
        description: 'Scans, API calls, no limits'
      },
      {
        icon: '🎯',
        title: 'Priority Support',
        description: '24/7 dedicated support'
      },
      {
        icon: '👥',
        title: 'Large Teams',
        description: 'Up to 20 team members'
      },
      {
        icon: '💾',
        title: 'Maximum Storage',
        description: '500 GB cloud storage'
      },
      {
        icon: '🌍',
        title: 'Global Languages',
        description: '11 languages supported'
      },
      {
        icon: '🔧',
        title: 'API Access',
        description: 'Full API with webhooks'
      },
      {
        icon: '📚',
        title: 'Advanced Docs',
        description: 'Complete documentation'
      }
    ],
    isActive: true,
    displayOrder: 3
  }
];

async function seedPricingData() {
  try {
    await connectDB();

    // Clear existing pricing data
    await Pricing.deleteMany({});

    // Insert new pricing plans
    const result = await Pricing.insertMany(pricingPlans);
    console.log('✅ Pricing data seeded successfully:', result.length, 'plans created');

    return result;
  } catch (error) {
    console.error('❌ Error seeding pricing data:', error.message);
    throw error;
  }
}

export default seedPricingData;

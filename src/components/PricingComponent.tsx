'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';

interface PricingPlan {
  _id: string;
  planName: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  sixMonthPrice: number;
  yearlyPrice: number;
  trialDays: number;
  trialExecutions: number;
  executionsPerMonth: number;
  storageGB: number;
  supportLevel: string;
  features: { name: string; included: boolean }[];
  toolsIncluded: { name: string; available: boolean }[];
  isActive: boolean;
  displayOrder: number;
  color: string;
  badge: string | null;
}

interface UserStatus {
  hasPremium: boolean;
  trialExceeded: boolean;
  currentPlan?: string;
}

export default function DynamicPricingPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const isDark = theme === 'dark';
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'sixMonth' | 'yearly'>('yearly');
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        checkAuthAndStatus(),
        fetchPricingPlans(),
        loadRazorpayScript()
      ]);
    };
    initializeData();
  }, [session]);

  const checkAuthAndStatus = async () => {
    // Wait for session to load
    if (status === 'loading') return;

    // Use NextAuth session instead of localStorage
    if (session?.user?.email) {
      try {
        const response = await fetch('/api/auth/verify-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setUserStatus(data);
        }
      } catch (err) {
        console.error('Error checking status:', err);
      }
    }
    // If not logged in, just continue showing pricing page
  };

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch('/api/pricing');
      
      if (response.ok) {
        const data = await response.json();
        const sortedPlans = (data.plans || []).sort((a: PricingPlan, b: PricingPlan) => 
          a.displayOrder - b.displayOrder
        );
        setPricingPlans(sortedPlans);
        
        // Set first plan as selected if not already set
        if (sortedPlans.length > 0 && !selectedPlanId) {
          setSelectedPlanId(sortedPlans[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching pricing:', err);
      setError('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);
    scriptRef.current = script;
  };

  const handleUpgrade = async (planId: string) => {
    const plan = pricingPlans.find(p => p._id === planId);
    if (!plan) return;

    if (!session?.user?.email) {
      setError('Email not found. Please log in again.');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('');
    setError('');

    try {
      const amount = billingPeriod === 'monthly' ? plan.monthlyPrice : billingPeriod === 'sixMonth' ? plan.sixMonthPrice : plan.yearlyPrice;

      const amountInPaise = Math.floor(amount * 100);
      // Determine duration based on billing period
      const duration = billingPeriod === 'monthly' ? 1 : billingPeriod === 'sixMonth' ? 6 : 12;
      const durationUnit = 'months';

      const orderResponse = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          plan: plan.planName,
          amount: amountInPaise,
          duration,
          durationUnit,
          planDisplayName: plan.displayName
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        setError(errorData.message || 'Failed to initiate payment');
        setIsProcessing(false);
        return;
      }

      const orderData = await orderResponse.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'TrustInn Platform',
        description: `${plan.displayName} Plan Subscription`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          setProcessingMessage('Verifying payment with Razorpay...');

          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              setIsProcessing(false);
              const errorMsg = verifyData.error || 'Payment verification failed';
              console.error('Payment verification failed:', errorMsg);
              setError(`❌ ${errorMsg}`);
              return;
            }

            setProcessingMessage('✅ Payment Verified! Activating your plan...');

            setTimeout(() => {
              setIsProcessing(false);
              alert('✅ Payment successful! Your premium plan is now active.');
              router.push('/trustinn');
            }, 2000);
          } catch (err) {
            console.error('Verification error:', err);
            setIsProcessing(false);
            setError('❌ Payment verification failed. Please contact support if money was deducted.');
          }
        },
        prefill: { email: session?.user?.email },
        theme: { color: '#3b82f6' }
      };

      if (window.Razorpay) {
        setProcessingMessage('💳 Preparing payment gateway...');
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        setError('Razorpay script not loaded. Please refresh and try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-white ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${
          isDark ? 'bg-blue-500 opacity-10' : 'bg-blue-300 opacity-20'
        }`}></div>
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl ${
          isDark ? 'bg-purple-500 opacity-10' : 'bg-purple-300 opacity-20'
        }`}></div>
      </div>

      <div className="relative z-10">
        {/* Premium Header Section */}
        <div className={`border-b backdrop-blur-sm ${
          isDark 
            ? 'border-slate-700/50 bg-slate-900/50' 
            : 'border-gray-200/50 bg-white/50'
        }`}>
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <div className={`inline-block mb-4 px-4 py-2 rounded-full ${
              isDark 
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50' 
                : 'bg-gradient-to-r from-blue-100/80 to-purple-100/80 border border-blue-200/50'
            }`}>
              <span className={`text-sm font-semibold ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}>💎 FLEXIBLE PRICING</span>
            </div>
            <h1 className={`text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent ${
              isDark 
                ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}>
              Choose Your Perfect Plan
            </h1>
            <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-4 ${
              isDark ? 'text-slate-300' : 'text-gray-600'
            }`}>
              Powerful tools for code analysis, testing, and verification at any scale
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Status Alerts */}
        {userStatus?.hasPremium && (
          <div className={`mb-12 p-6 rounded-lg ${
            isDark 
              ? 'bg-green-900 border border-green-700' 
              : 'bg-green-50 border border-green-200'
          }`}>
            <p className={`font-semibold ${
              isDark ? 'text-green-300' : 'text-green-800'
            }`}>✓ You already have {userStatus.currentPlan} active!</p>
          </div>
        )}

        {userStatus?.trialExceeded && !userStatus?.hasPremium && (
          <div className={`mb-12 p-6 rounded-lg ${
            isDark 
              ? 'bg-red-900 border border-red-700' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`font-semibold ${
              isDark ? 'text-red-300' : 'text-red-800'
            }`}>⏰ Your trial period has ended. Upgrade to continue!</p>
          </div>
        )}

        {error && (
          <div className={`mb-8 p-4 rounded-lg ${
            isDark 
              ? 'bg-red-900 border border-red-700 text-red-300' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {error}
          </div>
        )}

        {/* Billing Period Selector */}
        <div className="flex justify-center mb-12">
          <div className={`backdrop-blur-sm rounded-lg p-1 ${
            isDark 
              ? 'bg-slate-800/50 border border-slate-700' 
              : 'bg-white/50 border border-gray-200'
          }`}>
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : isDark 
                    ? 'text-slate-300 hover:text-white hover:bg-slate-700/50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('sixMonth')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                billingPeriod === 'sixMonth'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : isDark 
                    ? 'text-slate-300 hover:text-white hover:bg-slate-700/50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              6 Months
              <span className={`ml-1 text-xs px-1 py-0.5 rounded ${
                isDark 
                  ? 'bg-green-600/20 text-green-300' 
                  : 'bg-green-100/80 text-green-700'
              }`}>Save 17%</span>
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                billingPeriod === 'yearly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : isDark 
                    ? 'text-slate-300 hover:text-white hover:bg-slate-700/50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              12 Months
              <span className={`ml-1 text-xs px-1 py-0.5 rounded ${
                isDark 
                  ? 'bg-green-600/20 text-green-300' 
                  : 'bg-green-100/80 text-green-700'
              }`}>Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, idx) => {
            const isPopular = plan.badge === 'Most Popular';
            const price = billingPeriod === 'monthly' ? plan.monthlyPrice : billingPeriod === 'sixMonth' ? plan.sixMonthPrice : plan.yearlyPrice;
            const periodLabel = billingPeriod === 'monthly' ? 'month' : billingPeriod === 'sixMonth' ? '6 months' : 'year';
            const isCurrentPlan = userStatus?.currentPlan === plan.planName;

            const colorMap: any = isDark ? {
              'blue': { border: 'border-blue-500/50', bg: 'bg-gradient-to-br from-blue-900/30 to-blue-800/20', badge: 'bg-blue-500/20 text-blue-300', button: 'bg-blue-600 hover:bg-blue-700' },
              'purple': { border: 'border-purple-500/50', bg: 'bg-gradient-to-br from-purple-900/30 to-purple-800/20', badge: 'bg-purple-500/20 text-purple-300', button: 'bg-purple-600 hover:bg-purple-700' },
              'slate': { border: 'border-slate-600/50', bg: 'bg-gradient-to-br from-slate-800/50 to-slate-700/20', badge: 'bg-slate-600/20 text-slate-300', button: 'bg-slate-600 hover:bg-slate-700' },
            } : {
              'blue': { border: 'border-blue-300/50', bg: 'bg-gradient-to-br from-blue-100/60 to-blue-50/40', badge: 'bg-blue-100/80 text-blue-700', button: 'bg-blue-600 hover:bg-blue-700' },
              'purple': { border: 'border-purple-300/50', bg: 'bg-gradient-to-br from-purple-100/60 to-purple-50/40', badge: 'bg-purple-100/80 text-purple-700', button: 'bg-purple-600 hover:bg-purple-700' },
              'slate': { border: 'border-gray-300/50', bg: 'bg-gradient-to-br from-gray-100/60 to-gray-50/40', badge: 'bg-gray-100/80 text-gray-700', button: 'bg-gray-600 hover:bg-gray-700' },
            };

            const colors = colorMap[plan.color] || colorMap['slate'];

            return (
              <div
                key={plan._id}
                className={`relative rounded-2xl border backdrop-blur transition transform hover:shadow-2xl hover:scale-105 group
                  ${colors.border} ${colors.bg}
                  ${isPopular ? 'md:scale-105 shadow-2xl shadow-blue-500/20' : 'hover:shadow-lg'} 
                  p-8 overflow-hidden`}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
                  <div className={`absolute inset-0 ${colors.bg} blur-xl`}></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Badge */}
                  {plan.badge && (
                    <div className={`inline-block mb-4 px-3 py-1 ${colors.badge} text-xs font-bold rounded-full`}>
                      {plan.badge}
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <h3 className={`text-2xl font-bold mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{plan.displayName}</h3>
                    <p className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-gray-600'
                    }`}>{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-4xl font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>₹{price.toLocaleString('en-IN')}</span>
                      <span className={`${
                        isDark ? 'text-slate-400' : 'text-gray-500'
                      }`}>/{periodLabel}</span>
                    </div>
                    <p className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      {billingPeriod === 'monthly' ? 'Billed monthly' : 
                       billingPeriod === 'sixMonth' ? 'Billed every 6 months' : 
                       'Billed annually'}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(plan._id)}
                    disabled={isCurrentPlan || userStatus?.hasPremium}
                    className={`w-full py-3 rounded-lg font-semibold mb-8 transition ${
                      isCurrentPlan
                        ? 'bg-slate-600/50 text-slate-300 cursor-not-allowed'
                        : `${colors.button} text-white`
                    }`}
                  >
                    {isCurrentPlan ? '✓ Current Plan' : 'Upgrade Now'}
                  </button>

                  {/* Key Metrics */}
                  <div className={`space-y-3 mb-8 pb-8 border-b ${
                    isDark ? 'border-slate-700/50' : 'border-gray-200/50'
                  }`}>
                    <div className="text-sm">
                      <p className={`text-xs uppercase tracking-wide ${
                        isDark ? 'text-slate-400' : 'text-gray-500'
                      }`}>Executions/Month</p>
                      <p className={`font-semibold text-lg ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{plan.executionsPerMonth === -1 ? 'Unlimited' : plan.executionsPerMonth.toLocaleString()}</p>
                    </div>
                    <div className="text-sm">
                      <p className={`text-xs uppercase tracking-wide ${
                        isDark ? 'text-slate-400' : 'text-gray-500'
                      }`}>Support</p>
                      <p className={`font-semibold capitalize ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{plan.supportLevel}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <Check size={16} className="text-green-400 flex-shrink-0" />
                        ) : (
                          <X size={16} className={`flex-shrink-0 ${
                            isDark ? 'text-slate-500' : 'text-gray-400'
                          }`} />
                        )}
                        <span className={feature.included ? 
                          (isDark ? 'text-slate-300' : 'text-gray-700') : 
                          (isDark ? 'text-slate-500' : 'text-gray-400')
                        }>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tools */}
                  {plan.toolsIncluded.length > 0 && (
                    <div className={`mt-4 pt-4 border-t ${
                      isDark ? 'border-slate-700/50' : 'border-gray-200/50'
                    }`}>
                      <p className={`text-xs mb-3 uppercase tracking-wide ${
                        isDark ? 'text-slate-400' : 'text-gray-500'
                      }`}>Included Tools:</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.toolsIncluded.filter(t => t.available).map((tool, idx) => (
                          <span key={idx} className={`text-xs px-2 py-1 rounded-lg ${
                            isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-gray-100/80 text-gray-700'
                          }`}>
                            {tool.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Processing Modal */}
      {isProcessing && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${
          isDark ? 'bg-black bg-opacity-75' : 'bg-gray-900 bg-opacity-50'
        }`}>
          <div className={`rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 border ${
            isDark 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16">
                <div className={`absolute inset-0 rounded-full border-4 ${
                  isDark ? 'border-slate-700' : 'border-gray-200'
                }`}></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
              </div>
            </div>

            <h3 className={`text-xl font-bold text-center mb-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Payment Processing</h3>
            <p className={`text-center mb-6 ${
              isDark ? 'text-slate-300' : 'text-gray-600'
            }`}>
              {processingMessage || 'Payment is being processed...'}
            </p>
            
            <div className={`rounded p-4 mb-6 ${
              isDark 
                ? 'bg-yellow-900 border border-yellow-700' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`text-sm font-semibold text-center ${
                isDark ? 'text-yellow-300' : 'text-yellow-800'
              }`}>
                ⚠️ Please don't refresh or close this page until the transaction completes
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 animate-pulse">
                  ⋯
                </div>
                <span className={`${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>Processing your payment...</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center mr-3">
                  ◯
                </div>
                <span className={`${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>Verifying transaction...</span>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
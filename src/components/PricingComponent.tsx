'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, MessageSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import QuotationModal from './QuotationModal';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PricingPlan {
  _id: string;
  planName: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  sixMonthPrice: number;
  yearlyPrice: number;
  twoYearPrice?: number;
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
  const [isMounted, setIsMounted] = useState(false);
  const isDark = theme === 'dark';
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<'yearly' | 'twoYear'>('yearly');
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  
  // Quotation modal state
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedPlanForQuotation, setSelectedPlanForQuotation] = useState<PricingPlan | null>(null);

  // Hydration check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      // Only initialize after hydration
      if (!isMounted) return;

      // Wait a bit for session to load if it's still loading
      if (status === 'loading') {
        // Wait up to 2 seconds for session to load
        let attempts = 0;
        while (status === 'loading' && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
      }

      await Promise.all([
        checkAuthAndStatus(),
        fetchPricingPlans(),
        loadRazorpayScript()
      ]);
    };
    initializeData();
  }, [isMounted, session, status]);

  const checkAuthAndStatus = async () => {
    // Wait for session to load
    if (status === 'loading') return;

    console.log('PricingComponent - Session status:', status, 'Session:', session?.user?.email);

    // Check for stored session data as fallback (similar to dashboard)
    const checkStoredSession = () => {
      try {
        const storedSession = localStorage.getItem('nitminer_session') || sessionStorage.getItem('nitminer_session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          if (sessionData.user && sessionData.expires) {
            const expiresAt = new Date(sessionData.expires);
            if (expiresAt > new Date()) {
              console.log('Using stored session for pricing page');
              return sessionData.user;
            } else {
              // Clear expired session
              localStorage.removeItem('nitminer_session');
              sessionStorage.removeItem('nitminer_session');
              localStorage.removeItem('user_email');
              sessionStorage.removeItem('user_email');
            }
          }
        }
      } catch (error) {
        console.warn('Error checking stored session:', error);
      }
      return null;
    };

    const storedUser = checkStoredSession();

    // Use NextAuth session or stored session
    const userEmail = session?.user?.email || storedUser?.email;

    if (userEmail) {
      try {
        const response = await fetch('/api/auth/verify-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setUserStatus(data);
          console.log('User status loaded:', data);
        } else {
          console.error('Failed to verify status:', response.status);
        }
      } catch (err) {
        console.error('Error checking status:', err);
      }
    } else {
      console.log('No session or stored session found');
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

    // Check if session is still loading
    if (status === 'loading') {
      setError('Please wait while we verify your session...');
      return;
    }

    // Check for stored session as fallback
    const checkStoredSession = () => {
      try {
        const storedSession = localStorage.getItem('nitminer_session') || sessionStorage.getItem('nitminer_session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          if (sessionData.user && sessionData.expires) {
            const expiresAt = new Date(sessionData.expires);
            if (expiresAt > new Date()) {
              return sessionData.user;
            }
          }
        }
      } catch (error) {
        console.warn('Error checking stored session:', error);
      }
      return null;
    };

    const storedUser = checkStoredSession();

    // Check if user is authenticated (NextAuth session or stored session)
    if (!session && !storedUser) {
      setError('Please log in to upgrade your plan.');
      router.push('/login');
      return;
    }

    const userEmail = session?.user?.email || storedUser?.email;
    if (!userEmail) {
      setError('Session expired. Please log in again.');
      router.push('/login');
      return;
    }
 
    setIsProcessing(true);
    setProcessingMessage('');
    setError('');

    try {
      // Calculate amount based on plan and billing period
      let amount = 0;
      if (plan.planName === 'free_trials') {
        amount = 0;
      } else if (plan.planName === 'standard') {
        amount = plan.yearlyPrice; // 1 year
      } else if (plan.planName === 'premium_single_user') {
        amount = billingPeriod === 'yearly' ? plan.yearlyPrice : (plan.twoYearPrice || 10000); // 1 year or 2 years
      }

      const amountInPaise = Math.floor(amount * 100);
      // Determine duration based on plan type
      let duration = 12;
      let durationUnit = 'months';
      if (plan.planName === 'free_trials') {
        duration = 730; // 2 years in days
        durationUnit = 'days';
      } else if (plan.planName === 'premium_single_user' && billingPeriod === 'twoYear') {
        duration = 24; // 2 years
      }

      const orderResponse = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: session.user.email,
          plan: plan.planName,
          amount: amountInPaise,
          duration,
          durationUnit,
          planDisplayName: plan.displayName,
          customerName: session.user.name || session.user.email
        })
      });

      console.log('Payment initiate response status:', orderResponse.status);

      if (!orderResponse.ok) {
        let errorData;
        try {
          errorData = await orderResponse.json();
        } catch {
          errorData = { error: `Server error: ${orderResponse.status} ${orderResponse.statusText}` };
        }
        console.error('Payment initiate error:', errorData);
        setError(errorData.error || `Failed to initiate payment (${orderResponse.status})`);
        setIsProcessing(false);
        return;
      }

      const orderData = await orderResponse.json();
      console.log('Payment order created:', orderData);

      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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
              credentials: 'include',
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

            setTimeout(async () => {
              try {
                // Refresh user subscription status after payment
                console.log('Refreshing subscription status...');
                const refreshResponse = await fetch('/api/user/refresh-subscription', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include'
                });

                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  console.log('✅ Subscription refreshed:', refreshData);
                } else {
                  console.warn('Failed to refresh subscription, continuing anyway');
                }

                // Also refresh user status
                const statusResponse = await fetch('/api/auth/verify-status', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include'
                });

                if (statusResponse.ok) {
                  const updatedStatus = await statusResponse.json();
                  setUserStatus(updatedStatus);
                  console.log('✅ User status refreshed after payment:', updatedStatus);
                }

                // Generate JWT token for TrustInn access
                const tokenResponse = await fetch('/api/auth/generate-token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include'
                });

                if (!tokenResponse.ok) {
                  throw new Error('Failed to generate access token');
                }

                const tokenData = await tokenResponse.json();
                const jwtToken = tokenData.token;

                // Build TrustInn URL with JWT token
                const trustInnUrl = new URL('https://trustinn.nitminer.com/tools');
                trustInnUrl.searchParams.append('token', jwtToken);

                setIsProcessing(false);
                alert('✅ Payment successful! Your premium plan is now active.');
                
                // Redirect to TrustInn with JWT token
                window.location.href = trustInnUrl.toString();
              } catch (error) {
                console.error('Error generating token for TrustInn:', error);
                setIsProcessing(false);
                alert('✅ Payment successful! Your premium plan is now active.');
                // Fallback redirect without token
                router.push('/dashboard');
              }
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

  // Only render content after hydration to prevent mismatch
  if (!isMounted) {
    return (
      <div suppressHydrationWarning className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

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
    <div suppressHydrationWarning className={`min-h-screen text-white ${
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
            <div className={`inline-block mb-4 px-3 sm:px-4 py-2 rounded-full ${
              isDark 
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50' 
                : 'bg-gradient-to-r from-blue-100/80 to-purple-100/80 border border-blue-200/50'
            }`}>
              <span className={`text-xs sm:text-sm font-semibold ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}>💎 FLEXIBLE PRICING</span>
            </div>
            <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent ${
              isDark 
                ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}>
              Choose Your Perfect Plan
            </h1>
            <p className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-4 px-2 ${
              isDark ? 'text-slate-300' : 'text-gray-600'
            }`}>
              Get unlimited access to our comprehensive suite of 10 advanced analysis tools for C/C++, Java, Python, and Blockchain development
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Status Alerts */}
          {userStatus?.hasPremium && (
            <div className={`mb-8 sm:mb-12 p-4 sm:p-6 rounded-lg ${
              isDark 
                ? 'bg-green-900 border border-green-700' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <p className={`font-semibold text-sm sm:text-base ${
                isDark ? 'text-green-300' : 'text-green-800'
              }`}>✓ You already have {userStatus.currentPlan} active!</p>
            </div>
          )}

          {userStatus?.trialExceeded && !userStatus?.hasPremium && (
            <div className={`mb-8 sm:mb-12 p-4 sm:p-6 rounded-lg ${
              isDark 
                ? 'bg-red-900 border border-red-700' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-semibold text-sm sm:text-base ${
                isDark ? 'text-red-300' : 'text-red-800'
              }`}>⏰ Your trial period has ended. Upgrade to continue!</p>
            </div>
          )}

          {error && (
            <div className={`mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
              isDark 
                ? 'bg-red-900 border border-red-700 text-red-300' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {error}
            </div>
          )}

          {/* Billing Period Selector */}
          <div className="flex justify-center mb-8 sm:mb-12 overflow-x-auto px-2">
            <div className={`backdrop-blur-sm rounded-lg p-1 flex flex-nowrap gap-1 ${
              isDark 
                ? 'bg-slate-800/50 border border-slate-700' 
                : 'bg-white/50 border border-gray-200'
            }`}>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-3 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  billingPeriod === 'yearly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : isDark 
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700/50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                1 Year - ₹{pricingPlans.find(p => p.planName === 'premium_single_user')?.yearlyPrice.toLocaleString('en-IN') || '5,000'}
                <span className={`ml-1 text-xs px-1 py-0.5 rounded inline-block ${
                  isDark 
                    ? 'bg-blue-600/20 text-blue-300' 
                    : 'bg-blue-100/80 text-blue-700'
                }`}>Popular</span>
              </button>
              <button
                onClick={() => setBillingPeriod('twoYear')}
                className={`px-3 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  billingPeriod === 'twoYear'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : isDark 
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700/50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                2 Years - ₹{pricingPlans.find(p => p.planName === 'premium_single_user')?.twoYearPrice?.toLocaleString('en-IN') || '10,000'}
                <span className={`ml-1 text-xs px-1 py-0.5 rounded inline-block ${
                  isDark 
                    ? 'bg-purple-600/20 text-purple-300' 
                    : 'bg-purple-100/80 text-purple-700'
                }`}>Best Value</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 max-w-6xl mx-auto">
            {pricingPlans
              .filter(plan => plan.isActive)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((plan, idx) => {
              const isPopular = plan.badge === 'Most Popular';
              let price = 0;
              let periodLabel = '';
              
              if (plan.planName === 'free_trials') {
                price = 0;
                periodLabel = '2 years';
              } else if (plan.planName === 'standard') {
                price = plan.yearlyPrice;
                periodLabel = 'year';
              } else if (plan.planName === 'premium_single_user') {
                price = billingPeriod === 'yearly' ? plan.yearlyPrice : (plan.twoYearPrice || 10000);
                periodLabel = billingPeriod === 'yearly' ? 'year' : '2 years';
              }
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
                    ${isPopular ? 'sm:scale-105 shadow-2xl shadow-blue-500/20' : 'hover:shadow-lg'} 
                    p-6 sm:p-8 overflow-hidden flex flex-col h-full`}
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
                    <div className={`absolute inset-0 ${colors.bg} blur-xl`}></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Badge */}
                    {plan.badge && (
                      <div className={`inline-block mb-4 px-3 py-1 self-start ${colors.badge} text-xs font-bold rounded-full`}>
                        {plan.badge}
                      </div>
                    )}

                    {/* Header */}
                    <div className="mb-6">
                      <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{plan.displayName}</h3>
                      <p className={`text-xs sm:text-sm ${
                        isDark ? 'text-slate-400' : 'text-gray-600'
                      }`}>{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 sm:mb-8">
                      <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                        <span className={`text-xl sm:text-2xl font-bold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>₹{price.toLocaleString('en-IN')}</span>
                        <span className={`text-xs sm:text-base ${
                          isDark ? 'text-slate-400' : 'text-gray-500'
                        }`}>/{periodLabel}</span>
                      </div>
                      <p className={`text-xs ${
                        isDark ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        {plan.planName === 'free_trials' ? 'Free for 2 years' :
                         plan.planName === 'standard' ? 'One-time payment for 1 year' :
                         billingPeriod === 'yearly' ? 'One-time payment for 1 year' : 
                         'One-time payment for 2 years'}
                      </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3 mb-6 sm:mb-8">
                      <button
                        onClick={() => handleUpgrade(plan._id)}
                        disabled={isCurrentPlan || userStatus?.hasPremium}
                        className={`w-full py-3 rounded-lg font-semibold transition text-sm sm:text-base ${
                          isCurrentPlan
                            ? 'bg-slate-600/50 text-slate-300 cursor-not-allowed'
                            : `${colors.button} text-white`
                        }`}
                      >
                        {isCurrentPlan ? '✓ Current Plan' : 'Upgrade Now'}
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedPlanForQuotation(plan);
                          setShowQuotationModal(true);
                        }}
                        className={`w-full py-2.5 rounded-lg font-semibold transition text-sm sm:text-base flex items-center justify-center gap-2 ${
                          isDark 
                            ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Request Quotation
                      </button>
                    </div>

                    {/* Key Metrics */}
                    <div className={`space-y-3 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b ${
                      isDark ? 'border-slate-700/50' : 'border-gray-200/50'
                    }`}>
                      <div className="text-sm">
                        <p className={`text-xs uppercase tracking-wide ${
                          isDark ? 'text-slate-400' : 'text-gray-500'
                        }`}>Executions</p>
                        <p className={`font-semibold text-lg ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {plan.executionsPerMonth === -1 ? 'Unlimited' : 
                           `${plan.executionsPerMonth.toLocaleString()} trails`}
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className={`text-xs uppercase tracking-wide ${
                          isDark ? 'text-slate-400' : 'text-gray-500'
                        }`}>Support</p>
                        <p className={`font-semibold capitalize text-sm ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{plan.supportLevel}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-grow">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                          {feature.included ? (
                            <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X size={16} className={`flex-shrink-0 mt-0.5 ${
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

        {/* Tools Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Tools Section */}
          <div className="mb-16 sm:mb-20">
            {/* <div className="text-center mb-12">
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-clip-text text-transparent ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}>
                Advanced Analysis Tools
              </h2>
              <p className={`text-lg max-w-3xl mx-auto ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Comprehensive suite of 10 specialized tools for code analysis, testing, and verification across multiple programming languages and blockchain platforms
              </p>
            </div> */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* C/C++ Tools */}
              {/* <div className={`rounded-2xl border backdrop-blur-sm p-6 sm:p-8 ${
                isDark 
                  ? 'bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-600/50' 
                  : 'bg-gradient-to-br from-white/80 to-gray-50/60 border-gray-200/50'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">C++</span>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>C/C++ Tools (6 tools)</h3>
                    <p className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-gray-600'
                    }`}>Advanced static and dynamic analysis</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'CBMC', purpose: 'Test case reachability analysis', useCase: 'Verify which code paths are reachable' },
                    { name: 'KLEEMA', purpose: 'Mutation testing with dynamic symbolic execution', useCase: 'Find weak test cases' },
                    { name: 'KLEE', purpose: 'Path exploration & automatic test generation', useCase: 'Comprehensive test case creation' },
                    { name: 'TX', purpose: 'Fast path exploration with intelligent pruning', useCase: 'Large program analysis' },
                    { name: 'gMCov', purpose: 'MC/DC coverage profiler', useCase: 'Safety-critical code certification' },
                    { name: 'gMutant', purpose: 'Mutation quality assessment', useCase: 'Test suite quality evaluation' }
                  ].map((tool, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${
                      isDark ? 'bg-slate-700/30' : 'bg-gray-50/80'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-semibold ${
                          isDark ? 'text-blue-300' : 'text-blue-700'
                        }`}>{tool.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                        }`}>Active</span>
                      </div>
                      <p className={`text-sm mb-1 ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>{tool.purpose}</p>
                      <p className={`text-xs ${
                        isDark ? 'text-slate-400' : 'text-gray-500'
                      }`}>{tool.useCase}</p>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Other Tools */}
              <div className="space-y-6">
                {/* Java Tools */}
                {/* <div className={`rounded-2xl border backdrop-blur-sm p-6 ${
                  isDark 
                    ? 'bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-600/50' 
                    : 'bg-gradient-to-br from-white/80 to-gray-50/60 border-gray-200/50'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">JAVA</span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>Java Tools (1 tool)</h3>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isDark ? 'bg-slate-700/30' : 'bg-gray-50/80'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-semibold ${
                        isDark ? 'text-orange-300' : 'text-orange-700'
                      }`}>JBMC</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                      }`}>Active</span>
                    </div>
                    <p className={`text-sm mb-1 ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>Assertion verification & condition coverage</p>
                    <p className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}>Java program safety analysis</p>
                  </div>
                </div> */}

                {/* Python Tools */}
                {/* <div className={`rounded-2xl border backdrop-blur-sm p-6 ${
                  isDark 
                    ? 'bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-600/50' 
                    : 'bg-gradient-to-br from-white/80 to-gray-50/60 border-gray-200/50'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">PY</span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>Python Tools (1 tool)</h3>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isDark ? 'bg-slate-700/30' : 'bg-gray-50/80'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-semibold ${
                        isDark ? 'text-yellow-300' : 'text-yellow-700'
                      }`}>Python Analyzer</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                      }`}>Active</span>
                    </div>
                    <p className={`text-sm mb-1 ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>Condition coverage with fuzzing</p>
                    <p className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}>Python application testing</p>
                  </div>
                </div> */}

                {/* Blockchain Tools */}
                {/* <div className={`rounded-2xl border backdrop-blur-sm p-6 ${
                  isDark 
                    ? 'bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-600/50' 
                    : 'bg-gradient-to-br from-white/80 to-gray-50/60 border-gray-200/50'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Ξ</span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>Blockchain Tools (1 tool)</h3>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isDark ? 'bg-slate-700/30' : 'bg-gray-50/80'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-semibold ${
                        isDark ? 'text-purple-300' : 'text-purple-700'
                      }`}>VeriSol</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                      }`}>Active</span>
                    </div>
                    <p className={`text-sm mb-1 ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>Smart contract formal verification</p>
                    <p className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}>Ethereum/Solidity verification</p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
      {/* Quotation Modal */}
      {selectedPlanForQuotation && (
        <QuotationModal
          isOpen={showQuotationModal}
          onClose={() => {
            setShowQuotationModal(false);
            setSelectedPlanForQuotation(null);
          }}
          planName={selectedPlanForQuotation.planName}
          planDuration={billingPeriod === 'twoYear' ? '2 years' : '1 year'}
          numberOfTools={selectedPlanForQuotation.toolsIncluded.filter(t => t.available).length}
          estimatedPrice={
            selectedPlanForQuotation.planName === 'free_trials' ? 0 :
            selectedPlanForQuotation.planName === 'standard' ? selectedPlanForQuotation.yearlyPrice * 100 :
            billingPeriod === 'twoYear' ? (selectedPlanForQuotation.twoYearPrice || 10000) * 100 : selectedPlanForQuotation.yearlyPrice * 100
          }
          onSuccess={() => {
            // Refresh or show success message
            alert('Quotation request submitted successfully!');
          }}
        />
      )}

      {/* Processing Modal */}
      {isProcessing && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${
          isDark ? 'bg-black bg-opacity-75' : 'bg-gray-900 bg-opacity-50'
        }`}>
          <div className={`rounded-lg shadow-2xl p-6 sm:p-8 max-w-md w-full border ${
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

            <h3 className={`text-lg sm:text-xl font-bold text-center mb-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Payment Processing</h3>
            <p className={`text-center mb-6 text-sm sm:text-base ${
              isDark ? 'text-slate-300' : 'text-gray-600'
            }`}>
              {processingMessage || 'Payment is being processed...'}
            </p>
            
            <div className={`rounded p-3 sm:p-4 mb-6 ${
              isDark 
                ? 'bg-yellow-900 border border-yellow-700' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`text-xs sm:text-sm font-semibold text-center ${
                isDark ? 'text-yellow-300' : 'text-yellow-800'
              }`}>
                ⚠️ Please don't refresh or close this page until the transaction completes
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-xs sm:text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center mr-3 animate-pulse">
                  ⋯
                </div>
                <span className={`${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>Processing your payment...</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm">
                <div className="w-6 h-6 rounded-full bg-slate-600 text-white text-xs flex items-center justify-center mr-3">
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
    </div>
  );
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
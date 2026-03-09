'use client';

import { useState, useEffect } from 'react';
import { Check, X, RefreshCw } from 'lucide-react';

interface Subscription {
  _id?: string;
  plan?: string;
  planName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface LatestPayment {
  id?: string;
  planName?: string;
  planDuration?: string;
  amount?: number;
  completedAt?: string;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  isPremium: boolean;
  trialCount: number;
  subscriptionExpiry: string | null;
  subscription?: Subscription | null;
}

export default function ProfileTab() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [latestPayment, setLatestPayment] = useState<LatestPayment | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/me', {
        credentials: 'include',
      });
      
      console.log('[ProfileTab] API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[ProfileTab] User data loaded:', data.user?.email);
        setUser(data.user);
        if (data.latestPayment) {
          setLatestPayment(data.latestPayment);
        }
      } else {
        const errorData = await response.json();
        console.error('[ProfileTab] API error:', response.status, errorData);
        
        // Fallback to stored session
        const storedSession = localStorage.getItem('nitminer_session') || sessionStorage.getItem('nitminer_session');
        if (storedSession) {
          try {
            const sessionData = JSON.parse(storedSession);
            if (sessionData.user?.email) {
              setUser({
                name: sessionData.user.name || sessionData.user.email?.split('@')[0] || 'User',
                email: sessionData.user.email,
                role: sessionData.user.role || 'user',
                isPremium: false,
                trialCount: 5,
                subscriptionExpiry: null,
              });
            }
          } catch (parseError) {
            console.warn('Error parsing stored session:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('[ProfileTab] Fetch error:', error);
      
      // Fallback to stored session
      try {
        const storedSession = localStorage.getItem('nitminer_session') || sessionStorage.getItem('nitminer_session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          setUser({
            name: sessionData.user.name || sessionData.user.email?.split('@')[0] || 'User',
            email: sessionData.user.email,
            role: sessionData.user.role || 'user',
            isPremium: false,
            trialCount: 5,
            subscriptionExpiry: null,
          });
        }
      } catch (fallbackError) {
        console.warn('[ProfileTab] Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSubscription = async () => {
    try {
      setRefreshing(true);
      setMessage(null);

      const response = await fetch('/api/user/me', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[ProfileTab] Subscription synced:', data.user?.email);
        setUser(data.user);
        if (data.latestPayment) {
          setLatestPayment(data.latestPayment);
        }
        setMessage({ type: 'success', text: 'Subscription synced successfully!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to sync subscription' });
      }
    } catch (error) {
      console.error('[ProfileTab] Sync error:', error);
      setMessage({ type: 'error', text: 'Error syncing subscription. Please try again.' });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        `}</style>
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-900 dark:text-white font-bold text-sm sm:text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <div className="text-red-600 dark:text-red-400 font-bold text-center py-8 text-sm sm:text-base">
        Failed to load profile
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
      
      <div className="max-w-4xl mx-auto" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Profile
          </h2>
          <button
            onClick={handleRefreshSubscription}
            disabled={refreshing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 sm:px-5 py-2 rounded-lg transition shadow-lg font-bold text-sm sm:text-base"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            title="Refresh subscription status"
          >
            <RefreshCw size={16} className={`flex-shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg font-bold text-sm sm:text-base ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* User Information */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Account Information
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-bold">Name</p>
                <p className="text-gray-900 dark:text-white text-base sm:text-lg font-black break-words" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {user.name}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-bold">Email</p>
                <p className="text-gray-900 dark:text-white text-base sm:text-lg font-black break-all" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-bold">Account Type</p>
                <p className="text-gray-900 dark:text-white text-base sm:text-lg font-black capitalize" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {user.role}
                </p>
              </div>
            </div>
          </div>

          {/* Trial Information */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Free Trials
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="text-center sm:text-left flex-shrink-0">
                <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {user.trialCount}
                </p>
                <p className="text-gray-600 dark:text-gray-400 font-bold text-sm sm:text-base">Trials Remaining</p>
              </div>
              <div className="flex-1 w-full">
                <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2.5 sm:h-3">
                  <div
                    className="bg-blue-600 h-2.5 sm:h-3 rounded-full transition-all"
                    style={{ width: `${(user.trialCount / 50000) * 100}%` }}
                  ></div>
                </div>
                {/* <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-2 font-medium">
                  5 trials included for free
                </p> */}
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className={`rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 ${
            user.isPremium
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-yellow-50 dark:bg-yellow-900/20'
          }`}>
            <h3 className="text-lg sm:text-xl font-black mb-3 sm:mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {user.isPremium ? (
                <>
                  <Check size={20} className="sm:w-6 sm:h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-green-600 dark:text-green-400">Premium Active</span>
                </>
              ) : (
                <>
                  <X size={20} className="sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <span className="text-yellow-600 dark:text-yellow-400">Free Plan</span>
                </>
              )}
            </h3>

            {user.isPremium ? (
              <div>
                <p className="text-green-700 dark:text-green-300 font-bold text-sm sm:text-base">
                  You are enjoying full access to all tools!
                </p>
                {user.subscription?.endDate && (
                  <p className="text-green-700 dark:text-green-300 text-xs sm:text-sm mt-2 font-medium">
                    Expires on: {new Date(user.subscription.endDate).toLocaleDateString()}
                  </p>
                )}
                {user.subscriptionExpiry && !user.subscription?.endDate && (
                  <p className="text-green-700 dark:text-green-300 text-xs sm:text-sm mt-2 font-medium">
                    Expires on: {new Date(user.subscriptionExpiry).toLocaleDateString()}
                  </p>
                )}
                {!user.subscription?.endDate && !user.subscriptionExpiry && (
                  <p className="text-green-700 dark:text-green-300 text-xs sm:text-sm mt-2 font-medium">
                    Lifetime Premium Active
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-yellow-700 dark:text-yellow-300 font-bold text-sm sm:text-base">
                  Upgrade to premium for unlimited access
                </p>
                <a
                  href="/pricing"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl transition shadow-lg font-black text-sm sm:text-base"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  View Pricing Plans
                </a>
              </div>
            )}
          </div>

          {/* Payment Details */}
          {user.isPremium && user.subscription && typeof user.subscription === 'object' && latestPayment && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg sm:text-xl font-black text-blue-900 dark:text-blue-100 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Payment Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">Plan:</span>
                  <span className="text-blue-900 dark:text-blue-100 font-black text-sm capitalize">
                    {user.subscription?.planName || user.subscription?.plan || 'Premium'}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">Purchase Date:</span>
                  <span className="text-blue-900 dark:text-blue-100 font-black text-sm">
                    {latestPayment?.completedAt ? new Date(latestPayment.completedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">Amount Paid:</span>
                  <span className="text-blue-900 dark:text-blue-100 font-black text-sm">
                    ₹{latestPayment?.amount?.toLocaleString('en-IN') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">Subscription Ends:</span>
                  <span className="text-blue-900 dark:text-blue-100 font-black text-sm">
                    {user.subscription?.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">Status:</span>
                  <span className={`font-black text-xs px-3 py-1 rounded-full ${
                    user.subscription?.status === 'active'
                      ? 'bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {user.subscription?.status === 'active' ? 'Active' : user.subscription?.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
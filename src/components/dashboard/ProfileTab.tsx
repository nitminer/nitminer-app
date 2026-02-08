'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  isPremium: boolean;
  trialCount: number;
  subscriptionExpiry: string | null;
}

export default function ProfileTab() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const storedSession = localStorage.getItem('nitminer_session') || sessionStorage.getItem('nitminer_session');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (storedSession) {
        headers['x-nitminer-session'] = storedSession;
      }

      const response = await fetch('/api/user/me', {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          if (sessionData.user?.email) {
            const userResponse = await fetch('/api/user/profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-nitminer-session': storedSession,
              },
              body: JSON.stringify({ email: sessionData.user.email }),
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUser(userData.user);
            } else {
              setUser({
                name: sessionData.user.name || sessionData.user.email?.split('@')[0] || 'User',
                email: sessionData.user.email,
                role: sessionData.user.role || 'user',
                isPremium: false,
                trialCount: 5,
                subscriptionExpiry: null,
              });
            }
          }
        } catch (error) {
          console.warn('Error fetching user by email:', error);
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
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      
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
        console.warn('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
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
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-6 sm:mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Profile
        </h2>

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
                <p className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {user.trialCount}
                </p>
                <p className="text-gray-600 dark:text-gray-400 font-bold text-sm sm:text-base">Trials Remaining</p>
              </div>
              <div className="flex-1 w-full">
                <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2.5 sm:h-3">
                  <div
                    className="bg-blue-600 h-2.5 sm:h-3 rounded-full transition-all"
                    style={{ width: `${(user.trialCount / 9) * 100}%` }}
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
                {user.subscriptionExpiry && (
                  <p className="text-green-700 dark:text-green-300 text-xs sm:text-sm mt-2 font-medium">
                    Expires on: {new Date(user.subscriptionExpiry).toLocaleDateString()}
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
        </div>
      </div>
    </>
  );
}
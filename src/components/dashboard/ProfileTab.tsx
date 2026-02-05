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
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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
        <div className="text-gray-900 dark:text-white font-bold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Loading...</div>
      </>
    );
  }

  if (!user) {
    return <div className="text-red-600 dark:text-red-400 font-bold">Failed to load profile</div>;
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
      
      <div className="max-w-2xl" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Profile</h2>

        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Account Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">Name</p>
                <p className="text-gray-900 dark:text-white text-lg font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{user.name}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">Email</p>
                <p className="text-gray-900 dark:text-white text-lg font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{user.email}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">Account Type</p>
                <p className="text-gray-900 dark:text-white text-lg font-black capitalize" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{user.role}</p>
              </div>
            </div>
          </div>

          {/* Trial Information */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Free Trials</h3>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-black text-blue-600 dark:text-blue-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{user.trialCount}</p>
                <p className="text-gray-600 dark:text-gray-400 font-bold">Trials Remaining</p>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${(user.trialCount / 5) * 100}%` }}
                  ></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 font-medium">5 trials included for free</p>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className={`rounded-2xl shadow-xl p-6 ${
            user.isPremium
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-yellow-50 dark:bg-yellow-900/20'
          }`}>
            <h3 className="text-xl font-black mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {user.isPremium ? (
                <>
                  <Check size={24} className="text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400">Premium Active</span>
                </>
              ) : (
                <>
                  <X size={24} className="text-yellow-600 dark:text-yellow-400" />
                  <span className="text-yellow-600 dark:text-yellow-400">Free Plan</span>
                </>
              )}
            </h3>

            {user.isPremium ? (
              <div>
                <p className="text-green-700 dark:text-green-300 font-bold">You are enjoying full access to all tools!</p>
                {user.subscriptionExpiry && (
                  <p className="text-green-700 dark:text-green-300 text-sm mt-2 font-medium">
                    Expires on: {new Date(user.subscriptionExpiry).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-yellow-700 dark:text-yellow-300 font-bold">Upgrade to premium for unlimited access</p>
                <a
                  href="/pricing"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition shadow-lg font-black"
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
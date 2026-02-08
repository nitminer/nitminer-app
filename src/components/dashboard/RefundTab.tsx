'use client';

import { useState, useEffect } from 'react';
import { Package, AlertCircle } from 'lucide-react';
import RefundRequestForm from './RefundRequestForm';
import RefundRequestList from './RefundRequestList';

export default function RefundTab() {
  const [refreshList, setRefreshList] = useState(0);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch('/api/user/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.user?.isPremium || false);
      } else {
        setIsPremium(false);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    // Trigger a refresh of the refund list
    setRefreshList((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-900 dark:text-white font-bold text-sm">Checking eligibility...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="space-y-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Refunds
          </h2>
        </div>

        {!isPremium ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl sm:rounded-2xl p-6 sm:p-8">
            <div className="flex gap-4 items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-black text-yellow-700 dark:text-yellow-300 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Premium Plan Required
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 font-bold">
                  You don't have an active premium plan. Refund requests are only available for premium members.
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-3">
                  To request a refund, please purchase a premium plan first.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Form */}
            <RefundRequestForm onSuccess={handleFormSuccess} />

            {/* List */}
            <div>
              <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                My Refund Requests
              </h3>
              <RefundRequestList key={refreshList} />
            </div>
          </>
        )}
      </div>
    </>
  );
}

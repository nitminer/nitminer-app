'use client';

import { useState, useRef } from 'react';
import { FiSearch, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiCopy } from 'react-icons/fi';

interface SyncResult {
  email: string;
  status: 'success' | 'error' | 'not-found' | 'already-synced';
  isPremiumBefore: boolean;
  isPremiumAfter: boolean;
  subscription?: {
    plan: string;
    endDate: string;
  };
  message: string;
}

export default function SubscriptionSyncManagement() {
  const [email, setEmail] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [syncMode, setSyncMode] = useState<'single' | 'bulk'>('single');
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSingleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    try {
      setSyncing(true);
      setSyncResults([]);

      const response = await fetch('/api/admin/sync-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userEmail: email.trim().toLowerCase() }),
      });

      if (response.ok) {
        const data = await response.json();
        setSyncResults(data.results || [data]);
      } else {
        const errorData = await response.json();
        setSyncResults([{
          email: email.trim(),
          status: 'error',
          isPremiumBefore: false,
          isPremiumAfter: false,
          message: errorData.error || 'Failed to sync subscription',
        }]);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncResults([{
        email: email.trim(),
        status: 'error',
        isPremiumBefore: false,
        isPremiumAfter: false,
        message: 'Error during sync operation',
      }]);
    } finally {
      setSyncing(false);
    }
  };

  const handleBulkSync = async () => {
    try {
      setBulkSyncing(true);
      setSyncResults([]);

      const response = await fetch('/api/admin/sync-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ syncAll: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setSyncResults(data.results || []);
        alert(`Bulk sync completed: ${data.results?.length || 0} users processed`);
      } else {
        const errorData = await response.json();
        alert(`Bulk sync failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Bulk sync error:', error);
      alert('Error during bulk sync');
    } finally {
      setBulkSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 font-heading flex items-center gap-2">
          <FiRefreshCw className="text-blue-600" />
          Subscription Synchronization
        </h3>
        
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="single"
                checked={syncMode === 'single'}
                onChange={(e) => setSyncMode(e.target.value as 'single' | 'bulk')}
                className="rounded"
              />
              <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Sync Single User</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="bulk"
                checked={syncMode === 'bulk'}
                onChange={(e) => setSyncMode(e.target.value as 'single' | 'bulk')}
                className="rounded"
              />
              <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Sync All Users</span>
            </label>
          </div>

          {/* Single User Sync Form */}
          {syncMode === 'single' && (
            <form onSubmit={handleSingleSync} className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter user email address..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <button
                  type="submit"
                  disabled={syncing}
                  className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-white flex items-center gap-2 whitespace-nowrap transition-all ${
                    syncing
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                  }`}
                >
                  <FiRefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Syncing...' : 'Sync'}
                </button>
              </div>
            </form>
          )}

          {/* Bulk Sync Button */}
          {syncMode === 'bulk' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3 font-medium">
                This will process all users with successful payments but isPremium=false. This operation may take a while.
              </p>
              <button
                onClick={handleBulkSync}
                disabled={bulkSyncing}
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-white flex items-center gap-2 transition-all ${
                  bulkSyncing
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                }`}
              >
                <FiRefreshCw size={16} className={bulkSyncing ? 'animate-spin' : ''} />
                {bulkSyncing ? 'Syncing All Users...' : 'Start Bulk Sync'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {syncResults.length > 0 && (
        <div ref={resultsRef} className="space-y-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Sync Results</h3>
          {syncResults.map((result, index) => (
            <div
              key={index}
              className={`rounded-lg border p-4 ${
                result.status === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : result.status === 'already-synced'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.status === 'success' || result.status === 'already-synced' ? (
                  <FiCheckCircle size={20} className={`flex-shrink-0 mt-0.5 ${
                    result.status === 'success'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                ) : (
                  <FiAlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm sm:text-base ${
                      result.status === 'success'
                        ? 'text-green-900 dark:text-green-200'
                        : result.status === 'already-synced'
                        ? 'text-blue-900 dark:text-blue-200'
                        : 'text-red-900 dark:text-red-200'
                    }`}>
                      {result.email}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.email);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded"
                      title="Copy email"
                    >
                      <FiCopy size={14} />
                    </button>
                  </div>
                  
                  <p className={`text-xs sm:text-sm mt-1 ${
                    result.status === 'success'
                      ? 'text-green-700 dark:text-green-300'
                      : result.status === 'already-synced'
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {result.message}
                  </p>

                  {result.subscription && (
                    <div className="mt-2 text-xs sm:text-sm space-y-1">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Plan:</span> {result.subscription.plan}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Expires:</span> {new Date(result.subscription.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="mt-2 flex gap-4 text-xs sm:text-sm">
                    <span className={result.isPremiumBefore ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-500'}>
                      Before: {result.isPremiumBefore ? 'Premium' : 'Free'}
                    </span>
                    <span className={result.isPremiumAfter ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-500'}>
                      After: {result.isPremiumAfter ? 'Premium' : 'Free'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
        <h4 className="font-semibold text-sm sm:text-base text-blue-900 dark:text-blue-200 mb-2">What does this do?</h4>
        <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>Finds successful payments for the user(s)</li>
          <li>Calculates subscription expiry date based on plan duration</li>
          <li>Updates user profile with isPremium=true and subscription details</li>
          <li>Validates that subscription matches payment record</li>
          <li>Useful for fixing cases where payment succeeded but user field wasn't updated</li>
        </ul>
      </div>
    </div>
  );
}

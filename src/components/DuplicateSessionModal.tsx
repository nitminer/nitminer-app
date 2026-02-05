'use client';

import { useState } from 'react';
import { FiAlertTriangle, FiX, FiSmartphone, FiClock } from 'react-icons/fi';

interface ExistingSession {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  loginTime: string;
  lastActivity: string;
  ipAddress: string;
}

interface DuplicateSessionModalProps {
  isOpen: boolean;
  existingSessions: ExistingSession[];
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function DuplicateSessionModal({
  isOpen,
  existingSessions,
  onConfirm,
  onCancel,
  isLoading = false,
}: DuplicateSessionModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 mx-4 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <FiAlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Account Already Logged In
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detected login from another device
            </p>
          </div>
        </div>

        {/* Alert Message */}
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-900/50">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Your account is currently logged in from another device. If you continue, all other sessions will be logged out and this device will be the only active session.
          </p>
        </div>

        {/* Existing Sessions */}
        {existingSessions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Active Sessions
            </h3>
            <div className="space-y-3">
              {existingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  {/* Device Name and Browser */}
                  <div className="flex items-center gap-2 mb-2">
                    <FiSmartphone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {session.deviceName}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {session.browser} • {session.os}
                    </span>
                  </div>

                  {/* Login Time */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <FiClock className="w-3 h-3" />
                    <span>
                      Logged in: {formatDate(session.loginTime)}
                    </span>
                  </div>

                  {/* IP Address */}
                  {session.ipAddress && session.ipAddress !== 'unknown' && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      IP: {session.ipAddress}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Message */}
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            ℹ️ This is a security feature to protect your account from unauthorized access.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading || isConfirming}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || isConfirming}
            className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isConfirming ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              'Continue & Logout Other Sessions'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

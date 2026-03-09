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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 mx-4 border border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <FiAlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Account Already Logged In
            </h2>
            <p className="text-sm text-gray-600">
              Detected login from another device
            </p>
          </div>
        </div>

        {/* Alert Message */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <p className="text-sm text-yellow-800">
            Your account is currently logged in from another device. If you continue, all other sessions will be logged out and this device will be the only active session.
          </p>
        </div>

        {/* Existing Sessions */}
        {existingSessions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Active Sessions
            </h3>
            <div className="space-y-3">
              {existingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {/* Device Name and Browser */}
                  <div className="flex items-center gap-2 mb-2">
                    <FiSmartphone className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">
                      {session.deviceName}
                    </span>
                    <span className="text-xs text-gray-600">
                      {session.browser} • {session.os}
                    </span>
                  </div>

                  {/* Login Time */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FiClock className="w-3 h-3" />
                    <span>
                      Logged in: {formatDate(session.loginTime)}
                    </span>
                  </div>

                  {/* IP Address */}
                  {session.ipAddress && session.ipAddress !== 'unknown' && (
                    <div className="text-xs text-gray-600 mt-1">
                      IP: {session.ipAddress}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Message */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            ℹ️ This is a security feature to protect your account from unauthorized access.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading || isConfirming}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-200 text-gray-900 font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

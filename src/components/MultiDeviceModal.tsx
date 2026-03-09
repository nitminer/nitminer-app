'use client';

import { useState } from 'react';
import { FiAlertTriangle, FiX, FiTrash2 } from 'react-icons/fi';

interface MultiDeviceModalProps {
  isOpen: boolean;
  currentDevice: {
    browser?: string;
    os?: string;
    deviceName?: string;
  };
  previousDevice: {
    browser?: string;
    os?: string;
    deviceName?: string;
    loginTime?: string;
  };
  onRemoveOther: () => Promise<void>;
  onCancel: () => void;
}

export default function MultiDeviceModal({
  isOpen,
  currentDevice,
  previousDevice,
  onRemoveOther,
  onCancel,
}: MultiDeviceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRemoveOther = async () => {
    try {
      setIsLoading(true);
      setError('');
      await onRemoveOther();
    } catch (err: any) {
      setError(err.message || 'Failed to remove other sessions');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <FiAlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">
                Multiple Devices Detected
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your account is already logged in on another device. Choose what you'd like to do:
            </p>

            {/* Previous Device Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                Active Session
              </h3>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-medium">Device:</span>{' '}
                  {previousDevice.deviceName || 'Unknown Device'}
                </p>
                <p>
                  <span className="font-medium">Browser:</span>{' '}
                  {previousDevice.browser || 'Unknown'}
                </p>
                <p>
                  <span className="font-medium">OS:</span>{' '}
                  {previousDevice.os || 'Unknown'}
                </p>
                {previousDevice.loginTime && (
                  <p>
                    <span className="font-medium">Logged in:</span>{' '}
                    {new Date(previousDevice.loginTime).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Current Device Info */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                Current Device (This Login)
              </h3>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-medium">Device:</span>{' '}
                  {currentDevice.deviceName || 'Unknown Device'}
                </p>
                <p>
                  <span className="font-medium">Browser:</span>{' '}
                  {currentDevice.browser || 'Unknown'}
                </p>
                <p>
                  <span className="font-medium">OS:</span>{' '}
                  {currentDevice.os || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">✗ {error}</p>
              </div>
            )}
          </div>

          {/* Footer - Actions */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveOther}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Removing...
                </>
              ) : (
                <>
                  <FiTrash2 size={16} />
                  Remove Other Session
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

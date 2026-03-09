'use client';

import { useState, useEffect } from 'react';
import { FiX, FiMail } from 'react-icons/fi';

interface AdminOTPModalProps {
  isOpen: boolean;
  email: string;
  onSuccess: (otp: string) => void;
  onClose: () => void;
}

export default function AdminOTPModal({ isOpen, email, onSuccess, onClose }: AdminOTPModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [otpSent, setOtpSent] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isOpen || !otpSent) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, otpSent]);

  // Send OTP on modal open
  useEffect(() => {
    if (isOpen && !otpSent) {
      sendAdminOTP();
    }
  }, [isOpen, otpSent]);

  const sendAdminOTP = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setTimeLeft(300);
      console.log(`[ADMIN-OTP] Sent to ${data.sentTo}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: any) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      onSuccess(otpCode);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp(['', '', '', '', '', '']);
    await sendAdminOTP();
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
          >
            <FiX size={24} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <FiMail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h2
                className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-2"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Verify OTP
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Enter the 6-digit code sent to <br />
                <span className="font-black text-gray-800 dark:text-gray-300">{email}</span>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-center text-sm font-bold">
                  ✗ {error}
                </p>
              </div>
            )}

            {/* OTP Input */}
            {otpSent && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Digits */}
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isLoading}
                      className="w-12 h-14 text-center text-2xl font-black bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all disabled:opacity-50"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    />
                  ))}
                </div>

                {/* Timer */}
                <div className="text-center">
                  {timeLeft > 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Code expires in:{' '}
                      <span className="font-black text-blue-600 dark:text-blue-400">
                        {minutes}:{seconds.toString().padStart(2, '0')}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 dark:text-red-400 font-black">Code expired</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6 || timeLeft === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {/* Loading State */}
            {!otpSent && isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Resend OTP */}
            {otpSent && (
              <div className="mt-6 text-center pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResendOtp}
                  disabled={isLoading || timeLeft > 240}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-black text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {timeLeft > 240
                    ? `Resend in ${Math.floor((300 - timeLeft) / 60)}m`
                    : 'Resend OTP'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

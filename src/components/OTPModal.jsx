'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function OTPModal({ isOpen, email, onSuccess, onClose }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('authToken', data.token);
        sessionStorage.setItem('tempUser', JSON.stringify(data.user));
      }

      setOtp(['', '', '', '', '', '']);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Get signup data from sessionStorage if available
      const signupDataString = sessionStorage.getItem('signupData');
      const signupData = signupDataString ? JSON.parse(signupDataString) : {};

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName: signupData.firstName || '',
          lastName: signupData.lastName || '',
          phone: signupData.phone || '',
          password: signupData.password || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend OTP');
      }

      setTimeLeft(300);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
      
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
          >
            <FiX size={24} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-center text-blue-600 dark:text-blue-400 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Verify OTP
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm font-medium">
              Enter the 6-digit code sent to <br />
              <span className="font-black text-gray-800 dark:text-gray-300">{email}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <p className="text-red-700 dark:text-red-400 text-center text-sm font-bold">
                ✗ {error}
              </p>
            </div>
          )}

          {/* OTP Input */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 justify-center mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className="w-12 h-14 text-center text-2xl font-black bg-slate-50 dark:bg-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all disabled:opacity-50"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Code expires in: <span className="font-black text-blue-600 dark:text-blue-400">{minutes}:{seconds.toString().padStart(2, '0')}</span>
                </p>
              ) : (
                <p className="text-sm text-red-600 dark:text-red-400 font-black">Code expired</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6 || timeLeft === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={isLoading || timeLeft > 240}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-black text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {timeLeft > 240 ? `Resend in ${Math.floor((300 - timeLeft) / 60)}m` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
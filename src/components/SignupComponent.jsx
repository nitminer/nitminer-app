'use client';

import { useState, useEffect } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUser, FiPhone } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OTPModal from './OTPModal';
import Image from 'next/image';
import { generateDeviceInfo } from '@/lib/deviceFingerprint';

export default function SignupComponent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
      }
    };

    // Load Google API script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true);
    setError('');

    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Send ID token to backend signup endpoint
      const signupResponse = await fetch('/api/auth/google/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: response.credential,
        }),
        credentials: 'include',
      });

      const data = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(data.error || 'Google signup failed');
      }

      // Store user info in localStorage
      const userInfo = {
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        role: data.user.role,
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      sessionStorage.setItem('tempUser', JSON.stringify(userInfo));

      // Get device info for session tracking (optional)
      try {
        const deviceInfo = await generateDeviceInfo();
        sessionStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
      } catch (err) {
        console.warn('Failed to generate device info:', err);
      }

      setSuccess(true);
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err instanceof Error ? err.message : 'Google signup failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      sessionStorage.setItem('signupData', JSON.stringify(formData));
      setShowOTPModal(true);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = async () => {
    try {
      // User is already created and stored by OTPModal
      // Just clean up and redirect
      sessionStorage.removeItem('signupData');
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to complete signup');
      setShowOTPModal(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
      
      <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-black overflow-x-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="w-full max-w-7xl">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-0 rounded-2xl overflow-hidden shadow-2xl">
            {/* Left Section - Signup Form (40%) */}
            <div className="lg:col-span-4 bg-white dark:bg-zinc-800 flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10 order-2 lg:order-1 max-h-screen lg:max-h-none overflow-y-auto">
              {/* Signup Card */}
              <div className="relative">
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-center text-blue-600 dark:text-blue-400 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Create Account
                  </h1>
                  <p className="text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium px-2">
                    Join NitMiner Technologies today
                  </p>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <p className="text-green-700 dark:text-green-400 text-center font-bold text-xs sm:text-sm">
                      ✓ Account created successfully! Redirecting...
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <p className="text-red-700 dark:text-red-400 text-center font-bold text-xs sm:text-sm">
                      ✗ {error}
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="relative group">
                      <label htmlFor="firstName" className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-1 sm:mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        First Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors flex-shrink-0" size={16} />
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="First"
                          className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-xs sm:text-sm font-medium"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <label htmlFor="lastName" className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-1 sm:mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        Last Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors flex-shrink-0" size={16} />
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Last"
                          className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-xs sm:text-sm font-medium"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="relative group">
                    <label htmlFor="email" className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-1 sm:mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors flex-shrink-0" size={16} />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-xs sm:text-sm font-medium"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="relative group">
                    <label htmlFor="phone" className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-1 sm:mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors flex-shrink-0" size={16} />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-xs sm:text-sm font-medium"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="relative group">
                    <label htmlFor="password" className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-1 sm:mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors flex-shrink-0" size={16} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2 bg-slate-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-xs sm:text-sm font-medium"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors flex-shrink-0"
                        disabled={isLoading}
                      >
                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="relative group">
                    <label htmlFor="confirmPassword" className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-1 sm:mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors flex-shrink-0" size={16} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2 bg-slate-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-xs sm:text-sm font-medium"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors flex-shrink-0"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-2 sm:gap-3 cursor-pointer mt-2 sm:mt-4">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 cursor-pointer mt-0.5 flex-shrink-0"
                      disabled={isLoading}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-tight">
                      I agree to the{' '}
                      <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Terms & Conditions
                      </Link>
                      {' '}and{' '}
                      <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || success}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black py-2 sm:py-2.5 px-4 rounded-xl transition-all duration-300 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm mt-4 sm:mt-6"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </>
                    ) : success ? (
                      <>
                        <span>✓ Account Created</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <FiArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-4 sm:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-2 bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400 font-bold">Or sign up with</span>
                  </div>
                </div>

                {/* Google Sign-Up Button */}
                <div id="google-signup-button" className="w-full flex justify-center mb-4 sm:mb-6"></div>

                {/* Fallback Google Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.google) {
                      window.google.accounts.id.renderButton(
                        document.getElementById('google-signup-button'),
                        {
                          type: 'standard',
                          size: 'large',
                          theme: 'outline',
                          text: 'signup',
                        }
                      );
                    }
                  }}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-black py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-xs sm:text-sm"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.745 12.27c0-.79-.07-1.54-.2-2.25H12v4.26h6.47c-.29 1.48-1.45 2.74-3.08 3.56v3.93h4.84c2.92-2.69 4.6-6.65 4.6-11.5z" fill="#4285F4"/>
                    <path d="M12 24c3.48 0 6.38-1.15 8.51-3.12l-4.84-3.93c-1.15.78-2.62 1.23-3.67 1.23-2.86 0-5.3-1.92-6.16-4.53H2.18v4.07C4.32 22.75 7.98 24 12 24z" fill="#34A853"/>
                    <path d="M5.84 14.65c-.22-.78-.35-1.61-.35-2.65s.13-1.87.35-2.65V5.07H2.18C1.43 6.55 1 8.22 1 12s.43 5.45 1.18 6.93l3.85-2.85.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C18.38 2.08 15.48 1 12 1 7.98 1 4.32 2.75 2.18 5.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="hidden sm:inline">Sign up with Google</span>
                  <span className="sm:hidden">Google</span>
                </button>

                {/* Footer */}
                <p className="mt-4 sm:mt-6 text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium px-2">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-black transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Login here
                  </Link>
                </p>
              </div>
            </div>

            {/* Right Section - Image (60%) */}
            <div className="hidden lg:flex lg:col-span-6 bg-white dark:bg-zinc-900 items-center justify-center relative overflow-hidden order-3 lg:order-2 min-h-[400px]">
              <div className="relative z-10 w-full h-full flex items-center justify-center p-4 sm:p-8">
                <Image 
                  src="/auth/signup.png" 
                  alt="Signup Illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* OTP Modal */}
        <OTPModal 
          isOpen={showOTPModal}
          email={formData.email}
          onSuccess={handleOTPSuccess}
          onClose={() => setShowOTPModal(false)}
        />
      </main>
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUser, FiPhone } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import { generateDeviceInfo } from '@/lib/deviceFingerprint';

export default function SignupComponent() {
  const router = useRouter();
  const { data: session, status } = useSession();
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
  const [googleLoading, setGoogleLoading] = useState(false);

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && document.getElementById('google-signup-button')) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
          });

          // Render the button
          window.google.accounts.id.renderButton(
            document.getElementById('google-signup-button'),
            {
              type: 'standard',
              size: 'large',
              theme: 'outline',
              text: 'signup',
            }
          );
          console.log('✅ Google Sign-In button rendered successfully');
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      }
    };

    // Load Google API script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => console.error('Failed to load Google API script');
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    console.log('[GOOGLE-SIGNUP] Received response from Google');
    setGoogleLoading(true);
    setError('');

    try {
      if (!response.credential) {
        console.error('[GOOGLE-SIGNUP] No credential in response:', response);
        throw new Error('No credential received from Google');
      }

      console.log('[GOOGLE-SIGNUP] Sending ID token to backend...');

      // Step 1: Create the user via custom signup endpoint
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

      console.log('[GOOGLE-SIGNUP] Backend response status:', signupResponse.status);

      const data = await signupResponse.json();

      if (!signupResponse.ok) {
        console.error('[GOOGLE-SIGNUP] Backend error:', data);
        if (signupResponse.status !== 409) {
          throw new Error(data.error || 'Google signup failed');
        }
        console.log('[GOOGLE-SIGNUP] User already exists');
      } else {
        console.log('[GOOGLE-SIGNUP] Signup successful, user:', data.user);
      }

      // Step 2: Create NextAuth session using the create-session endpoint
      console.log('[GOOGLE-SIGNUP] Creating NextAuth session...');
      
      const sessionResponse = await fetch('/api/auth/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: data.user.id,
          email: data.user.email,
        }),
        credentials: 'include',
      });

      if (!sessionResponse.ok) {
        console.error('[GOOGLE-SIGNUP] Failed to create session:', await sessionResponse.json());
        // Continue anyway - at least user is created
      } else {
        console.log('[GOOGLE-SIGNUP] NextAuth session created successfully');
      }

      // Step 3: Redirect to dashboard
      console.log('[GOOGLE-SIGNUP] Session established, redirecting to dashboard...');    
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err) {
      console.error('[GOOGLE-SIGNUP] Error:', err);
      setError(err instanceof Error ? err.message : 'Google signup failed. Please try again.');
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
      // Create user directly without OTP verification (for testing purposes)
      const response = await fetch('/api/auth/signup-direct', {
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
        throw new Error(data.error || 'Failed to create account');
      }

      // Sign in the user directly
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error || 'Failed to sign in');
      }

      setSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
      
      <main className="min-h-[calc(80vh-200px)] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-black overflow-x-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="w-full max-w-7xl">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-0 rounded-2xl overflow-hidden shadow-2xl">
            {/* Left Section - Signup Form (40%) */}
            <div className="lg:col-span-4 bg-white dark:bg-zinc-800 flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10 order-2 lg:order-1 max-h-screen lg:max-h-none overflow-y-auto">
              {/* Signup Card */}
              <div className="relative">
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-black text-center text-blue-600 dark:text-blue-400 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
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

                {/* Alternative Email/Password Signup Link */}
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
      </main>
    </>
  );
}
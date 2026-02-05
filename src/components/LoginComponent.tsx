'use client';

import { useState, useEffect } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import Image from "next/image"
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginTypeSelector from './LoginTypeSelector';
import DuplicateSessionModal from './DuplicateSessionModal';
import { generateDeviceInfo } from '@/lib/deviceFingerprint';
import { useSessionValidator, useStorageSessionListener } from '@/hooks/useSessionValidator';

interface ExistingSession {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  loginTime: string;
  lastActivity: string;
  ipAddress: string;
}

export default function LoginComponent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { validateSession } = useSessionValidator();
  useStorageSessionListener();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [existingSessions, setExistingSessions] = useState<ExistingSession[]>([]);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  // Initialize device info on component mount
  useEffect(() => {
    generateDeviceInfo().then((info) => {
      console.log('Device info generated:', info);
      setDeviceInfo(info);
    });
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user) {
      // Redirect based on role
      const dashboardUrl = session.user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      router.push(dashboardUrl);
    }
  }, [session, status, router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!deviceInfo) {
        setError('Device information could not be loaded. Please try again.');
        setIsLoading(false);
        return;
      }

      // Check for duplicate sessions before Google login
      // Pass browser info to prevent multi-browser login on same device
      const checkResponse = await fetch('/api/auth/session/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email || 'google-user',
          deviceId: deviceInfo.deviceId,
          deviceFingerprint: deviceInfo.fingerprint,
          browser: deviceInfo.browser, // Include browser to prevent multi-browser login
        }),
      });

      const checkData = await checkResponse.json();
      if (checkData.isDuplicate && checkData.existingSessions.length > 0) {
        setExistingSessions(checkData.existingSessions);
        setShowDuplicateModal(true);
        setIsLoading(false);
        return;
      }

      const result = await signIn('google', {
        callbackUrl: '/',
        redirect: false,
      });

      if (result?.error) {
        setError('Google sign-in failed. Please try again.');
      } else if (result?.ok) {
        setSuccess(true);
        // Create session after successful Google login
        if (session?.user?.id) {
          await createUserSession(session.user.id, session.user.email || '');
        }
      }
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
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

  const createUserSession = async (userId: string, email: string) => {
    try {
      if (!deviceInfo) return;

      const response = await fetch('/api/auth/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          deviceId: deviceInfo.deviceId,
          deviceFingerprint: deviceInfo.fingerprint,
          deviceName: deviceInfo.deviceName,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
        }),
      });

      const data = await response.json();
      if (data.success && data.sessionToken) {
        localStorage.setItem('session_token', data.sessionToken);
        localStorage.setItem('session_id', data.sessionId);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleDuplicateModalConfirm = async () => {
    try {
      // Invalidate all other sessions
      if (deviceInfo) {
        await fetch('/api/auth/session/invalidate-others', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: pendingEmail,
            deviceId: deviceInfo.deviceId,
          }),
        });
      }

      // Clear modal and proceed with login
      setShowDuplicateModal(false);
      setPendingEmail('');
      setPendingPassword('');
      await performLogin(pendingEmail, pendingPassword);
    } catch (error) {
      console.error('Error handling duplicate session:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const performLogin = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.ok) {
        setSuccess(true);
        setFormData({ email: '', password: '', rememberMe: false });
        
        // Create session record in database after successful login
        if (deviceInfo) {
          try {
            const response = await fetch('/api/auth/session/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: email, // Use email as unique identifier
                email,
                deviceId: deviceInfo.deviceId,
                deviceFingerprint: deviceInfo.fingerprint,
                deviceName: deviceInfo.deviceName,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
              }),
            });

            if (!response.ok) {
              console.error(`[LOGIN] Session creation failed: ${response.status} ${response.statusText}`);
              const errorText = await response.text();
              console.error('[LOGIN] Error response:', errorText);
              // Don't fail the login - session creation is not critical
              console.warn('[LOGIN] Warning: Session creation failed, but login was successful');
            } else {
              const data = await response.json();
              if (data.success && data.sessionToken) {
                localStorage.setItem('session_token', data.sessionToken);
                localStorage.setItem('session_id', data.sessionId);
                console.log('[LOGIN] Session created successfully');
              }
            }
          } catch (error) {
            console.error('Error creating session:', error);
          }
        }
        
        // Wait a moment then redirect
        setTimeout(() => {
          console.log('[LOGIN] Redirecting to dashboard...');
          router.push('/dashboard');
        }, 500);
        
        return;
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      if (!deviceInfo) {
        setError('Device information could not be loaded. Please try again.');
        setIsLoading(false);
        return;
      }

      // Check for duplicate sessions before login
      // Pass browser info to prevent multi-browser login on same device
      const checkResponse = await fetch('/api/auth/session/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          deviceId: deviceInfo.deviceId,
          deviceFingerprint: deviceInfo.fingerprint,
          browser: deviceInfo.browser, // Include browser to prevent multi-browser login
        }),
      });

      const checkData = await checkResponse.json();
      console.log('Duplicate check response:', checkData);
      
      if (checkData.isDuplicate && checkData.existingSessions.length > 0) {
        // Store pending credentials and show modal
        console.log('Duplicate session detected, showing modal');
        setPendingEmail(formData.email);
        setPendingPassword(formData.password);
        setExistingSessions(checkData.existingSessions);
        setShowDuplicateModal(true);
        setIsLoading(false);
        return;
      }

      console.log('No duplicate session, proceeding with login');
      // No duplicate, proceed with login
      await performLogin(formData.email, formData.password);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DuplicateSessionModal
        isOpen={showDuplicateModal}
        existingSessions={existingSessions}
        onConfirm={handleDuplicateModalConfirm}
        onCancel={() => {
          setShowDuplicateModal(false);
          setPendingEmail('');
          setPendingPassword('');
        }}
        isLoading={isLoading}
      />
      
      <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-black" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="w-full max-w-7xl">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-0 rounded-2xl overflow-hidden shadow-2xl">
            {/* Left Section - Image (60%) */}
            <div className="hidden lg:flex lg:col-span-6 bg-white dark:bg-blue-500 items-center justify-center relative overflow-hidden">
              <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                <Image 
                  src="/auth/login_png.png" 
                  alt="Login Illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Right Section - Login Form (40%) */}
            <div className="lg:col-span-4 bg-white dark:bg-zinc-800 flex flex-col justify-center p-8 md:p-10">
              {/* Login Type Selector */}
              <div className="mb-6 flex justify-end">
                <LoginTypeSelector />
              </div>

              {/* Login Card */}
              <div className="relative">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-4xl font-black text-center text-blue-600 dark:text-blue-400 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Welcome Back
                  </h1>
                  <p className="text-center text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Login to your NitMiner account
                  </p>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <p className="text-green-700 dark:text-green-400 text-center font-bold">
                      ✓ Login successful! Redirecting...
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <p className="text-red-700 dark:text-red-400 text-center font-bold">
                      ✗ {error}
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div className="relative group">
                    <label htmlFor="email" className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors" size={20} />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="relative group">
                    <label htmlFor="password" className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-600 cursor-pointer"
                        disabled={isLoading}
                      />
                      <span className="text-gray-600 dark:text-gray-400 font-bold">Remember me</span>
                    </label>
                    <Link href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-black transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || success}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Logging in...</span>
                      </>
                    ) : success ? (
                      <>
                        <span>✓ Success</span>
                      </>
                    ) : (
                      <>
                        <span>Login</span>
                        <FiArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400 font-bold">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign-In Button */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading || success}
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-300 font-black py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Footer */}
                <p className="mt-8 text-center text-gray-600 dark:text-gray-400 font-medium">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-black transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
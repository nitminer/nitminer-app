'use client';

import { useState, useEffect } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import Image from "next/image"
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import LoginTypeSelector from './LoginTypeSelector';

export default function AdminLoginComponent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [demoCredentials, setDemoCredentials] = useState(null);
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);

  // Check if user is already logged in as admin
  useEffect(() => {
    const checkAuthStatus = () => {
      const authToken = sessionStorage.getItem('authToken');
      
      if (authToken) {
        setIsAlreadyLoggedIn(true);
      }
    };
    checkAuthStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleCreateAdmin = async () => {
    setSetupLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await response.json();

      console.log('[ADMIN-LOGIN] Seed response:', response.status, data);

      if (response.ok || response.status === 400) {
        if (data.credentials) {
          setDemoCredentials(data.credentials);
          // Pre-fill the form with demo credentials
          setFormData({
            email: data.credentials.email,
            password: data.credentials.password,
            rememberMe: false
          });
          // Store credentials temporarily for auto-login
          sessionStorage.setItem('_tempAdminEmail', data.credentials.email);
          sessionStorage.setItem('_tempAdminPassword', data.credentials.password);
          setError('');
          setSuccess(true);
          // Redirect to admin dashboard after 1.5 seconds
          setTimeout(() => {
            router.push('/admin/dashboard');
          }, 1500);
        } else {
          setError('Failed to get credentials from server');
        }
      } else {
        setError(data.message || data.error || 'Failed to create admin user');
      }
    } catch (err) {
      console.error('[ADMIN-LOGIN] Seed error:', err);
      setError('Failed to create admin user: ' + err.message);
    } finally {
      setSetupLoading(false);
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

      // Use NextAuth signIn instead
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);
      } else {
        setError('Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-white dark:bg-black">
      <div className="w-full max-w-7xl">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-0 rounded-2xl overflow-hidden shadow-2xl dark:shadow-2xl">
          {/* Left Section - Image (60%) */}
          <div className="hidden lg:flex lg:col-span-6 bg-white dark:bg-gray-900 items-center justify-center relative overflow-hidden">
            {/* Image Content */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
              <Image 
                src="/auth/admin_login.png" 
                alt="Admin Login Illustration"
                fill
                className="object-contain dark:bg-blue-400"
                priority
              />
            </div>
          </div>

          {/* Right Section - Admin Login Form (40%) */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-800 flex flex-col justify-center p-8 md:p-10">
            {/* Login Type Selector */}
            <div className="mb-6 flex justify-end">
              <LoginTypeSelector />
            </div>

            {/* Login Card */}
            <div className="relative">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-red-600 bg-clip-text text-transparent mb-2">
              Admin Access
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              Administrators only - Secure login required
            </p>
          </div>

          {/* Already Logged In Message */}
          {isAlreadyLoggedIn && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-400 font-semibold mb-3">✓ You are already logged in as Admin!</p>
              <p className="text-green-600 dark:text-green-300 text-sm mb-4">
                You already have an active admin session. Please access your admin dashboard to continue.
              </p>
              <Link 
                href="/admin/dashboard"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
              >
                Go to Admin Dashboard →
              </Link>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg opacity-0 animate-in fade-in duration-300">
              <p className="text-green-700 dark:text-green-400 text-center font-medium">
                ✓ Admin login successful! Redirecting...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3 items-start">
              <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 dark:text-red-400 font-medium text-sm">
                {error}
              </p>
            </div>
          )}

          {/* Demo Credentials Display */}
          {demoCredentials && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-700 dark:text-blue-400 font-semibold mb-3">✓ Demo Admin Created!</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded">
                  <code className="text-blue-600 dark:text-blue-300 font-mono">{demoCredentials.email}</code>
                </div>
                <div className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded">
                  <code className="text-blue-600 dark:text-blue-300 font-mono">{"••••••••"}</code>
                </div>
              </div>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-2">Form auto-filled with demo credentials ↓</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-4 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@company.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative flex items-center">
                <FiLock className="absolute left-4 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 dark:bg-gray-700 dark:text-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
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
                  className="w-4 h-4 text-purple-600 border-2 border-gray-200 rounded focus:ring-2 focus:ring-purple-200 dark:border-gray-600 dark:focus:ring-purple-900"
                />
                <span className="text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <Link href="/admin/forgot-password" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-red-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Admin Login</span>
                  <FiArrowRight size={20} />
                </>
              )}
            </button>

            {/* Setup Button */}
            {!demoCredentials && (
              <button
                type="button"
                onClick={handleCreateAdmin}
                disabled={setupLoading}
                className="w-full mt-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-70"
              >
                {setupLoading ? 'Creating Demo Admin...' : 'Create Demo Admin (admin@nitminer.com)'}
              </button>
            )}
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Not an admin?{' '}
              <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                User Login
              </Link>
            </p>
          </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

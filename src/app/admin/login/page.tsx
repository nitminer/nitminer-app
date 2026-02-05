'use client';

import { useState, useEffect } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import Image from "next/image";
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginTypeSelector from '@/components/LoginTypeSelector';
import Header from '@/components/Header'

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
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

  // Check if user is already logged in as admin
  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user && session.user.role === 'admin') {
      router.push('/admin/dashboard');
    }
  }, [session, status, router]);

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

      if (response.ok) {
        setDemoCredentials(data);
        setShowSetup(false);
      } else {
        setError(data.error || 'Failed to create admin');
      }
    } catch (err) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid admin credentials');
      } else if (result?.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Header/>
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-white dark:bg-black">
      <div className="w-full max-w-7xl">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-0 rounded-2xl overflow-hidden shadow-2xl dark:shadow-2xl">
          {/* Left Section - Image (60%) */}
          <div className="hidden lg:flex lg:col-span-6 bg-white dark:bg-gray-900 items-center justify-center relative overflow-hidden">
            {/* Image Content */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
              <Image
                src="/auth/login_png.png"
                alt="Admin Login Illustration"
                fill
                className="object-contain dark:bg-amber-100"
                priority
              />
            </div>
          </div>

          {/* Right Section - Login Form (40%) */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-800 flex flex-col justify-center p-8 md:p-10">
            {/* Login Type Selector */}
            <div className="mb-6 flex justify-end">
              <LoginTypeSelector />
            </div>

            {/* Admin Login Card */}
            <div className="relative">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Admin Access
                </h1>
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                  Login to admin dashboard
                </p>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg opacity-0 animate-in fade-in duration-300">
                  <p className="text-green-700 dark:text-green-400 text-center font-medium">
                    ✓ Admin login successful! Redirecting to dashboard...
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-400 text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Demo Credentials Display */}
              {demoCredentials && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Demo Admin Credentials:</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Email:</strong> {demoCredentials.email}<br />
                    <strong>Password:</strong> {demoCredentials.password}
                  </p>
                </div>
              )}

              {/* Setup Admin Button */}
              {!demoCredentials && (
                <div className="mb-6">
                  <button
                    onClick={handleCreateAdmin}
                    disabled={setupLoading}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {setupLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Setting up admin...</span>
                      </>
                    ) : (
                      <>
                        <FiAlertCircle size={20} />
                        <span>Setup Demo Admin</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="relative group">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-red-500 transition-colors" size={20} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@nitminer.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="relative group">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Admin Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-red-500 transition-colors" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter admin password"
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || success}
                  className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </>
                  ) : success ? (
                    <>
                      <span>✓ Success</span>
                    </>
                  ) : (
                    <>
                      <span>Admin Login</span>
                      <FiArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
                <Link href="/" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold transition-colors">
                  ← Back to main site
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

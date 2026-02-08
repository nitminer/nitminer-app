'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import LoginComponent from "@/components/LoginComponent";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (data.authenticated && data.user) {
          // User is already logged in, redirect to dashboard
          router.replace('/dashboard');
          setIsAuthenticated(true);
        } else {
          // User is not logged in, show login page
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // If session check fails, show login page
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If already logged in, show nothing (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <Header />
      <LoginComponent />
    </div>
  );
}

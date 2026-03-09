'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // If admin is logged in, redirect to dashboard
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      console.log('[AdminPage] Admin detected, redirecting to dashboard');
      router.push('/admin/dashboard');
    }
  }, [session, status, router]);

  // Show loading state while checking session
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

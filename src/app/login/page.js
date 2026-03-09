'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Header from "@/components/Header";
import LoginComponent from "@/components/LoginComponent";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user) {
      // User is already logged in, redirect based on role
      if (session.user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    } else {
      // User is not authenticated
      setIsChecking(false);
    }
  }, [status, session, router]);

  // Show loading while checking auth
  if (isChecking || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If already logged in, don't render login (redirect in progress)
  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="flex  flex-col bg-zinc-50 font-sans dark:bg-black">

      <LoginComponent />
    </div>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Header from "@/components/Header";
import LoginComponent from "@/components/LoginComponent";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const defaultTrustInnRedirect = 'https://trustinn.nitminer.com/tools';

  const requestedRedirect = searchParams.get('redirect');
  const redirectTo =
    !requestedRedirect || requestedRedirect === '/tools' || requestedRedirect === '/trustinn'
      ? defaultTrustInnRedirect
      : requestedRedirect;

  const redirectAfterLogin = useCallback((target) => {
    if (typeof window !== 'undefined' && /^https?:\/\//i.test(target)) {
      window.location.assign(target);
      return;
    }
    router.replace(target);
  }, [router]);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user) {
      // User is already logged in, redirect to intended page
      redirectAfterLogin(redirectTo);
    }
  }, [status, session, redirectTo, redirectAfterLogin]);

  // Show loading while checking auth
  if (status === 'loading') {
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSessionValidator } from '@/hooks/useSessionValidator';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProfileTab from '@/components/dashboard/ProfileTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import UsageTab from '@/components/dashboard/UsageTab';
import RefundTab from '@/components/dashboard/RefundTab';
import MyQuotations from '@/components/dashboard/MyQuotations';
import Header from '@/components/Header';
import Inbox from '@/components/Inbox';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userName, setUserName] = useState<string>('User');

  // Use session validator for additional security
  // useSessionValidator();

  useEffect(() => {
    // Fetch user profile to display name
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user?.firstName) {
            setUserName(data.user.firstName);
          }
        }
      } catch (error) {
        console.warn('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();

    // Check for stored session data as backup
    const checkStoredSession = () => {
      try {
        const storedSession = localStorage.getItem('nitminer_session') || sessionStorage.getItem('nitminer_session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          if (sessionData.user && sessionData.expires) {
            const expiresAt = new Date(sessionData.expires);
            if (expiresAt > new Date()) {
              // Valid stored session, trust it
              setIsCheckingAuth(false);
              return true;
            } else {
              // Expired stored session, clear it
              localStorage.removeItem('nitminer_session');
              sessionStorage.removeItem('nitminer_session');
              localStorage.removeItem('user_email');
              sessionStorage.removeItem('user_email');
            }
          }
        }
      } catch (error) {
        console.warn('Error checking stored session:', error);
      }
      return false;
    };

    if (status === 'loading') {
      // If we have stored session, don't wait for NextAuth
      if (checkStoredSession()) {
        return;
      }
      setIsCheckingAuth(true);
      return;
    }

    setIsCheckingAuth(false);

    // Check for recent login success
    const loginSuccess = localStorage.getItem('login_success');
    const loginTime = localStorage.getItem('login_time');
    let isRecentLogin = false;

    if (loginSuccess === 'true' && loginTime) {
      const timeDiff = new Date().getTime() - new Date(loginTime).getTime();
      // If login was recent (within 30 seconds), give session more time to establish
      if (timeDiff < 30000) {
        isRecentLogin = true;
        console.log('Recent login detected in dashboard, waiting for session...');
      }
    }

    console.log('[Dashboard] Auth check:', { status, isAuthenticated: !!session?.user, isRecentLogin, loginTime });

    // If we have valid stored session, allow access
    if (checkStoredSession()) {
      console.log('[Dashboard] Using stored session');
      return;
    }

    // If NextAuth says authenticated, we're good
    if (status === 'authenticated' && session?.user) {
      console.log('[Dashboard] NextAuth authenticated, allowing access');
      return;
    }

    // If not authenticated and no valid stored session and not recent login, redirect to login
    if (status === 'unauthenticated' && !isRecentLogin) {
      // Clear login success flag
      console.log('[Dashboard] Unauthenticated and not recent login, redirecting to /login');
      localStorage.removeItem('login_success');
      localStorage.removeItem('login_time');
      
      router.push('/login');
      return;
    }

    // If authenticated but admin, redirect to admin dashboard
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      console.log('[Dashboard] Admin user, redirecting to admin dashboard');
      router.push('/admin/dashboard');
      return;
    }

    if (isRecentLogin) {
      console.log('[Dashboard] Recent login, showing loading state');
    }

    // Clear login success flag once we're properly authenticated
    if (status === 'authenticated') {
      console.log('[Dashboard] Clearing login success flags after authentication');
      localStorage.removeItem('login_success');
      localStorage.removeItem('login_time');
    }
  }, [status, session, router]);

  // Show loading while checking auth
  if (status === 'loading' || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-black">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-900 dark:text-white font-bold">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, the useEffect will handle redirect
  if (status === 'unauthenticated') {
    // Check if we have valid stored session
    const hasValidStoredSession = (() => {
      try {
        const storedSession = localStorage.getItem('nitminer_session') || sessionStorage.getItem('nitminer_session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          if (sessionData.user && sessionData.expires) {
            const expiresAt = new Date(sessionData.expires);
            return expiresAt > new Date();
          }
        }
      } catch (error) {
        console.warn('Error checking stored session:', error);
      }
      return false;
    })();

    if (!hasValidStoredSession) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-black">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-700 dark:text-gray-300">Redirecting to login...</p>
          </div>
        </div>
      );
    }
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
      
      <Header/>
      <DashboardLayout>
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-zinc-700 mb-8 overflow-x-auto" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'payments', label: 'Payments' },
            { id: 'refund', label: 'Refunds' },
            { id: 'quotations', label: 'Quotations' },
            { id: 'usage', label: 'Usage' },
            { id: 'inbox', label: 'Inbox' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-black transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'refund' && <RefundTab />}
        {activeTab === 'quotations' && <MyQuotations />}
        {activeTab === 'usage' && <UsageTab />}
        {activeTab === 'inbox' && <Inbox role="user" />}
      </DashboardLayout>
    </>
  );
}
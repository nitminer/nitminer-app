'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  CreditCard,
  BarChart3,
  Settings,
  Activity,
  Home,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSessionValidator } from '@/hooks/useSessionValidator';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [notifications, setNotifications] = useState(0);
  const [currentPath, setCurrentPath] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [userFirstName, setUserFirstName] = useState<string>('User');
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Use session validator for additional security
  useSessionValidator();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Auto-open on desktop
      } else {
        setSidebarOpen(false); // Auto-close on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    if (isMobile && sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, sidebarOpen]);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  useEffect(() => {
    // Fetch user's first name for display
    const fetchUserFirstName = async () => {
      try {
        const response = await fetch('/api/user/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user?.firstName) {
            setUserFirstName(data.user.firstName);
          }
        }
      } catch (error) {
        console.warn('Error fetching user name:', error);
      }
    };

    fetchUserFirstName();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const storedSession = localStorage.getItem('nitminer_session') || sessionStorage.getItem('nitminer_session');
        
        const headers: Record<string, string> = {};
        
        if (storedSession) {
          headers['x-nitminer-session'] = storedSession;
        }

        const response = await fetch('/api/user/notifications', { headers });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (status === 'authenticated') {
      fetchNotifications();
    }
  }, [status]);

  useEffect(() => {
    const checkStoredSession = () => {
      try {
        const storedSession = localStorage.getItem('nitminer_session') || sessionStorage.getItem('nitminer_session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          if (sessionData.user && sessionData.expires) {
            const expiresAt = new Date(sessionData.expires);
            if (expiresAt > new Date()) {
              return true;
            } else {
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

    if (status === 'loading') return;

    if (session?.user?.role === 'admin') {
      router.push('/admin/dashboard');
      return;
    }
  }, [status, session, router]);

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
    { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
    { href: '/dashboard/usage', label: 'Usage', icon: BarChart3 },
    { href: '/dashboard/activity', label: 'Activity', icon: Activity },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  if (status === 'loading') {
    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        `}</style>
        
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-900 dark:text-white font-bold">Loading dashboard...</span>
          </div>
        </div>
      </>
    );
  }

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

  if (status === 'unauthenticated' && !hasValidStoredSession) {
    return null;
  }

  const getUserData = () => {
    if (session?.user) {
      return session.user;
    }
    
    try {
      const storedSession = localStorage.getItem('nitminer_session') || sessionStorage.getItem('nitminer_session');
      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        if (sessionData.user) {
          return sessionData.user;
        }
      }
    } catch (error) {
      console.warn('Error getting user data:', error);
    }
    
    return { name: 'User', email: '' };
  };

  const userData = getUserData();

  const handleNavClick = (href: string) => {
    if (isMobile) {
      setSidebarOpen(false);
    }
    router.push(href);
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        /* Hide scrollbars but keep functionality */
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
      
      <div className="bg-white dark:bg-zinc-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* Mobile Overlay */}
        

        {/* Main Content */}
        <div className={`flex-1 flex flex-col relative z-10 transition-all duration-300`}>
          {/* Page Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900 hide-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
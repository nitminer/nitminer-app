'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
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
import { signOut, useSession } from 'next-auth/react';
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

  const handleLogout = async () => {
    localStorage.removeItem('nitminer_session');
    sessionStorage.removeItem('nitminer_session');
    localStorage.removeItem('user_email');
    sessionStorage.removeItem('user_email');
    localStorage.removeItem('auth_token');
    
    await signOut({ callbackUrl: '/login' });
  };

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
      `}</style>
      
      <div className="flex h-screen bg-white dark:bg-zinc-900 overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`
            ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
            ${sidebarOpen ? (isMobile ? 'w-64 sm:w-72' : 'w-48 lg:w-64') : 'w-0 lg:w-20'}
            bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 
            transition-all duration-300 flex flex-col shadow-xl
            ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          `}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 lg:p-6 flex items-center justify-between border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
            {sidebarOpen && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-xs sm:text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>NI</span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  NITMiner
                </h1>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 flex-shrink-0"
            >
              {sidebarOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1.5 sm:space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    size={18}
                    className={`sm:w-5 sm:h-5 flex-shrink-0 transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}
                  />
                  {sidebarOpen && (
                    <span className="font-black text-sm sm:text-base truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile Section */}
          {sidebarOpen && (
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-zinc-700 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {userFirstName?.[0] || userData?.email?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white font-black text-xs sm:text-sm truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {userFirstName}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs truncate font-medium">
                    {userData?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-zinc-700 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-black text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex-shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700"
                >
                  <Menu size={20} />
                </button>

                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Dashboard
                </h2>
                
                {/* Search - Hidden on small mobile */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-zinc-700 rounded-xl flex-1 max-w-xs">
                  <Search size={16} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-sm w-full font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700">
                  <Bell size={18} className="sm:w-5 sm:h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-600 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {notifications}
                    </span>
                  )}
                </button>

                {/* User Menu - Hidden on mobile, shown in sidebar */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-white font-black text-sm truncate max-w-[150px]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium truncate max-w-[150px]">
                      {session?.user?.email}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
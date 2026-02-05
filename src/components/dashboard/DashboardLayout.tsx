'use client';

import { useState, useEffect } from 'react';
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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(0);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/user/notifications');
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
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

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

  if (status === 'unauthenticated' || session?.user?.role === 'admin') {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
      
      <div className="flex h-screen bg-white dark:bg-zinc-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 transition-all duration-300 flex flex-col shadow-xl`}
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-zinc-700">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>NI</span>
                </div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>NITMiner</h1>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    size={20}
                    className={`transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}
                  />
                  {sidebarOpen && (
                    <span className="font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{item.label}</span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* User Profile Section */}
          {sidebarOpen && (
            <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white font-black text-sm truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs truncate font-medium">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg"
            >
              <LogOut size={20} />
              {sidebarOpen && <span className="font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Logout</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Dashboard</h2>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-zinc-700 rounded-xl">
                  <Search size={16} className="text-gray-600 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-sm w-48 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700">
                  <Bell size={20} />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {notifications}
                    </span>
                  )}
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <div className="hidden md:block text-right">
                    <p className="text-gray-900 dark:text-white font-black text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                      {session?.user?.email}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-black text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-8 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
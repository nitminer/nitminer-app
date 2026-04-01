'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  BarChart3,
  Users,
  CreditCard,
  Menu,
  X,
  Bell,
  Settings,
  ChevronRight,
  LogOut,
  Zap
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useSessionValidator } from '@/hooks/useSessionValidator';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useSessionValidator();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/admin/login');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1FF] dark:bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#3F3351] dark:text-white font-black uppercase tracking-widest text-xs">Initializing Admin...</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1FF] dark:bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#3F3351] dark:text-white font-black uppercase tracking-widest text-xs">
            Redirecting to Admin Login...
          </span>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { href: '/admin/dashboard', label: 'Overview', icon: BarChart3 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F5F1FF] dark:bg-[#0A0A0A] overflow-hidden" style={{ fontFamily: "'League Spartan', sans-serif" }}>
      
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* --- CINEMATIC SIDEBAR --- */}
      <aside
        ref={sidebarRef}
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${sidebarOpen ? 'w-72' : 'w-20'}
          bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl
          border-r border-indigo-100 dark:border-white/5 
          transition-all duration-500 ease-in-out flex flex-col
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-24 flex items-center px-6 border-b border-indigo-50 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="text-white w-6 h-6 fill-white" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black text-[#3F3351] dark:text-white tracking-tighter">NITMINER</span>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Admin Panel</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                    : 'text-gray-500 hover:bg-indigo-50 dark:hover:bg-white/5 hover:text-indigo-600'
                  }
                `}
              >
                <Icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                {sidebarOpen && (
                  <span className="font-bold text-sm uppercase tracking-wider">{item.label}</span>
                )}
                {isActive && sidebarOpen && (
                  <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: User Profile */}
        <div className="p-4 border-t border-indigo-50 dark:border-white/5">
          <div className={`flex items-center gap-3 p-3 rounded-2xl bg-indigo-50 dark:bg-white/5 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              {session?.user?.name?.[0] || 'A'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-[#3F3351] dark:text-white font-black text-xs uppercase truncate">{session?.user?.name || 'Admin'}</p>
                <p className="text-gray-400 text-[10px] truncate">{session?.user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Cinematic Top Header */}
        <header className="h-20 bg-white/50 dark:bg-black/20 backdrop-blur-md border-b border-indigo-50 dark:border-white/5 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 bg-white dark:bg-white/5 rounded-xl shadow-sm border border-indigo-100 dark:border-white/10 text-indigo-600"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-2xl font-black text-[#3F3351] dark:text-white uppercase tracking-tighter">
              Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-gray-400 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
            </button>
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl font-bold text-xs uppercase hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 20px; }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}

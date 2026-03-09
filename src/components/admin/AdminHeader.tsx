'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FiMenu, FiRotateCw, FiLogOut, FiUser, FiChevronDown,
  FiBell, FiActivity, FiX
} from 'react-icons/fi';
import { useSession, signOut } from 'next-auth/react';

interface AdminHeaderProps {
  activeTab: string;
  isMobile: boolean;
  sidebarOpen: boolean;
  onMenuToggle: () => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

export default function AdminHeader({
  activeTab,
  isMobile,
  sidebarOpen,
  onMenuToggle,
  onRefresh,
  isRefreshing,
}: AdminHeaderProps) {

  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  /* ------------------ TIME ------------------ */
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ------------------ PAGE TITLE ------------------ */
  const getPageTitle = () => {
    const titles: Record<string, string> = {
      overview: 'Admin Dashboard',
      users: 'Identity Vault',
      payments: 'Revenue Flow',
      refunds: 'Refund Management',
      'refund-requests': 'Support Requests',
      quotations: 'Procurement',
      'sync-subscriptions': 'Nexus Sync',
      inbox: 'Communications',
      analytics: 'Traffic Metrics',
      settings: 'Core Config',
    };
    return titles[activeTab] || 'Dashboard';
  };

  /* ------------------ LOGOUT ------------------ */
  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      const keys = ['nitminer_session', 'user_email', 'login_success', 'login_time'];
      keys.forEach(k => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    }

    const callbackUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/login`
        : '/login';

    await signOut({ callbackUrl, redirect: false });

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 150);
    }
  };

  /* ------------------ OUTSIDE CLICK ------------------ */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="
        mt-10 relative z-[9999] 
        h-20 flex items-center 
        bg-white/40 dark:bg-zinc-950/40 
        backdrop-blur-2xl 
        border-b border-indigo-100 dark:border-white/5 
        px-4 sm:px-8 lg:px-10 
        select-none
      "
      style={{ fontFamily: "'League Spartan', sans-serif" }}
    >
      <div className="w-full flex items-center justify-between gap-4">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">

          {/* MENU TOGGLE */}
          <button
            onClick={onMenuToggle}
            className="
              w-10 h-10 flex items-center justify-center rounded-xl
              bg-white/10 dark:bg-white/5
              border border-white/10 
              text-white

              tap-highlight-transparent
              active:bg-transparent
              focus:bg-transparent
              select-none

              sm:hover:bg-white/20
            "
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>

          {/* PAGE TITLE */}
          <div className="hidden sm:block truncate">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#3F3351] dark:text-white uppercase tracking-tight leading-none truncate">
              {getPageTitle()}
            </h2>

            <div className="flex items-center gap-2 mt-1 opacity-60 text-[10px]">
              <FiActivity size={10} className="text-indigo-600" />
              <p className="font-black uppercase tracking-wider truncate">
                {activeTab} / Status: Live
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* TIME */}
          <div className="hidden lg:flex flex-col items-end mr-2 whitespace-nowrap">
            <p className="text-xs font-black text-[#3F3351] dark:text-white">
              {currentTime}
            </p>
            <p className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">
              Network Synced
            </p>
          </div>

          {/* REFRESH */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 h-10 px-3 sm:px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all 
              ${
                isRefreshing
                  ? 'bg-indigo-600 text-white cursor-wait'
                  : 'bg-white dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-indigo-600 hover:bg-indigo-600 hover:text-white'
              }`}
          >
            <FiRotateCw className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden md:inline">Refresh Sync</span>
          </button>

          {/* NOTIFICATIONS */}
          <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-slate-400 hover:text-indigo-600 transition">
            <FiBell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-white dark:border-zinc-900 animate-pulse"></span>
          </button>

          {/* USER MENU */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 h-10 px-3 bg-[#3F3351] dark:bg-indigo-600 text-white rounded-xl shadow hover:opacity-90 transition"
            >
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-black text-[10px]">
                {session?.user?.name?.[0] || 'A'}
              </div>
              <FiChevronDown
                className={`transition-transform duration-300 ${
                  showUserMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showUserMenu && (
              <div
                className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-zinc-900 border border-indigo-50 dark:border-white/10 rounded-2xl shadow-xl p-2"
              >
                <div className="p-4 border-b border-indigo-50 dark:border-white/10">
                  <p className="font-black text-[#3F3351] dark:text-white uppercase text-xs truncate">
                    {session?.user?.name || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold truncate mt-1">
                    {session?.user?.email}
                  </p>
                </div>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition">
                  <FiUser /> Edit Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest text-red-500 transition"
                >
                  <FiLogOut /> System Exit
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { 
  FiLogOut, FiBarChart, FiUsers, FiCreditCard, FiPieChart, 
  FiSettings, FiUser, FiMenu, FiX, FiRotateCw, FiMail, 
  FiFileText, FiRefreshCw, FiHeadphones, FiZap, FiChevronRight, FiHome, FiClock
} from 'react-icons/fi';

// Components
import AdminHeader from '@/components/admin/AdminHeader';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import UsersManagement from '@/components/admin/UsersManagement';
import PaymentsManagement from '@/components/admin/PaymentsManagement';
import CompletedRefundsTab from '@/components/admin/CompletedRefundsTab';
import RefundRequestsManagement from '@/components/admin/RefundRequestsManagement';
import QuotationRequestsManagement from '@/components/admin/QuotationRequestsManagement';
import SubscriptionSyncManagement from '@/components/admin/SubscriptionSyncManagement';
import InternshipStudentsManagement from '@/components/admin/InternshipStudentsManagement';
import LiveSupportPanel from '@/components/admin/LiveSupportPanel';
import UserActivityManagement from '@/components/admin/UserActivityManagement';
import Inbox from '@/components/Inbox';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Logic States
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // --- LOGIC: DEVICE CHECK & SIDEBAR RESPONSIVENESS ---
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

  // --- LOGIC: CLICK OUTSIDE SIDEBAR ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };
    if (isMobile && sidebarOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // --- LOGIC: AUTH GUARD ---
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/login');
    }
  }, [session, status, router]);

  // --- LOGIC: SESSION CLEANUP & LOGOUT ---
  const handleLogout = async () => {
    setIsLoggingOut(true);
    if (typeof window !== 'undefined') {
      const keys = ['nitminer_session', 'user_email', 'login_success', 'login_time'];
      keys.forEach(k => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    }
    const callbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login';
    await signOut({ callbackUrl, redirect: false });
    setTimeout(() => { window.location.href = '/login'; }, 150);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) setSidebarOpen(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setRefreshTrigger(prev => prev + 1);
      await new Promise(resolve => setTimeout(resolve, 800));
    } finally {
      setIsRefreshing(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1FF] dark:bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#3F3351] dark:text-white font-black uppercase tracking-widest text-xs">Authenticating Admin...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'admin') return null;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: FiBarChart },
    { id: 'users', label: 'All Users', icon: FiUsers },
    { id: 'user-activity', label: 'User Activity', icon: FiClock },
    { id: 'payments', label: 'Payments', icon: FiCreditCard },
    { id: 'internship-students', label: 'Internship', icon: FiUsers },
    { id: 'refunds', label: 'Refunds', icon: FiRotateCw },
    { id: 'refund-requests', label: 'Requests', icon: FiMail },
    { id: 'support', label: 'Live Support', icon: FiHeadphones },
    { id: 'quotations', label: 'Quotations', icon: FiFileText },
    { id: 'sync-subscriptions', label: 'Subscription Sync', icon: FiRefreshCw },
    { id: 'inbox', label: 'Inbox', icon: FiMail },
    { id: 'analytics', label: 'Analytics', icon: FiPieChart },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1FF] dark:bg-[#0A0A0A] " style={{ fontFamily: "'League Spartan', sans-serif" }}>
      
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* --- CINEMATIC SIDEBAR --- */}
      <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl overflow-hidden
          border-r border-indigo-100 dark:border-white/5 transition-all duration-500 ease-in-out
          ${sidebarOpen ? 'w-72' : (isMobile ? 'w-0' : 'w-20')}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          flex flex-col
        `}
      >
        <div className="h-24 flex items-center px-6 border-b border-indigo-50 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FiZap className="text-white w-6 h-6 fill-white" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black text-[#3F3351] dark:text-white tracking-tighter">NITMINER</span>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Administrator</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`
                w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative
                ${activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                  : 'text-gray-500 hover:bg-indigo-50 dark:hover:bg-white/5 hover:text-indigo-600'
                }
              `}
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon size={20} className="shrink-0" />
              {sidebarOpen && <span className="font-bold text-sm uppercase tracking-wider truncate">{item.label}</span>}
              {activeTab === item.id && sidebarOpen && <FiChevronRight className="absolute right-4 opacity-40" />}
            </button>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-indigo-50 dark:border-white/5">
          {sidebarOpen && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50 dark:bg-white/5 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shrink-0">
                {session.user.name?.[0] || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-[#3F3351] dark:text-white font-black text-xs uppercase truncate">{session.user.name}</p>
                <p className="text-gray-400 text-[10px] truncate">Administrator Access</p>
              </div>
            </div>
          )}
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-xs uppercase transition-all text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 mb-2"
            title={!sidebarOpen ? 'Go to Home' : ''}
          >
            <FiHome /> {sidebarOpen && 'Go to Home'}
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-xs uppercase transition-all ${
              isLoggingOut ? 'opacity-50 grayscale' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
            }`}
          >
            <FiLogOut /> {sidebarOpen && (isLoggingOut ? 'Exiting...' : 'Logout')}
          </button>
        </div>
      </aside>

      {/* --- MAIN VIEWPORT --- */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ${sidebarOpen ? 'ml-72' : (isMobile ? 'ml-0' : 'ml-20')}`}>
        
        {/* Cinematic Header Component */}
        <AdminHeader
          activeTab={activeTab}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          onMenuToggle={() => !isLoggingOut && setSidebarOpen(!sidebarOpen)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing || isLoggingOut}
        />

        {/* Mobile Horizontal Tab Scroll */}
        {isMobile && (
          <div className="bg-white dark:bg-zinc-900 border-b border-indigo-50 dark:border-white/5 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 p-3 min-w-max">
              {navItems.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-white/5 text-gray-500 border border-indigo-50 dark:border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- MAIN CONTENT SCROLL AREA --- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-gradient-to-b from-white to-[#F5F1FF] dark:from-[#0A0A0A] dark:to-black">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'overview' && <AnalyticsDashboard key={`overview-${refreshTrigger}`} refreshTrigger={refreshTrigger} />}
            {activeTab === 'users' && <UsersManagement key={`users-${refreshTrigger}`} refreshTrigger={refreshTrigger} />}
            {activeTab === 'user-activity' && <UserActivityManagement key={`user-activity-${refreshTrigger}`} refreshTrigger={refreshTrigger} />}
            {activeTab === 'payments' && <PaymentsManagement key={`payments-${refreshTrigger}`} refreshTrigger={refreshTrigger} />}
            {activeTab === 'internship-students' && <InternshipStudentsManagement key={`internship-students-${refreshTrigger}`} refreshTrigger={refreshTrigger} />}
            {activeTab === 'refunds' && <CompletedRefundsTab key={`refunds-${refreshTrigger}`} refreshTrigger={refreshTrigger} />}
            {activeTab === 'refund-requests' && <RefundRequestsManagement key={`refund-requests-${refreshTrigger}`} refreshTrigger={refreshTrigger} />}
            {activeTab === 'support' && <LiveSupportPanel key={`support-${refreshTrigger}`} />}
            {activeTab === 'quotations' && <QuotationRequestsManagement key={`quotations-${refreshTrigger}`} refreshTrigger={refreshTrigger} />}
            {activeTab === 'sync-subscriptions' && <SubscriptionSyncManagement key={`sync-subscriptions-${refreshTrigger}`} />}
            {activeTab === 'inbox' && <Inbox role="admin" key={`inbox-${refreshTrigger}`} refreshTrigger={refreshTrigger} />}
            {activeTab === 'analytics' && <AnalyticsDashboard key={`analytics-${refreshTrigger}`} refreshTrigger={refreshTrigger} />}
            {activeTab === 'settings' && (
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-lg rounded-[40px] border border-white/20 dark:border-white/5 p-10">
                <h3 className="text-xl font-black text-[#3F3351] dark:text-white mb-4 uppercase tracking-tighter">Admin Settings</h3>
                <p className="text-gray-500 font-bold italic">Centralized system configurations and admin security protocols are managed here.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 20px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
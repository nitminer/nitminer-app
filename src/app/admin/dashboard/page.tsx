'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { FiLogOut, FiBarChart, FiUsers, FiCreditCard, FiPieChart, FiSettings, FiUser, FiMenu, FiX } from 'react-icons/fi';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import UsersManagement from '@/components/admin/UsersManagement';
import PaymentsManagement from '@/components/admin/PaymentsManagement';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
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
    if (status === 'loading') return;

    if (!session?.user || session.user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login', redirect: true });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative font-sans">
      
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
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'fixed top-0 left-0 h-screen'}
          ${sidebarOpen ? 'w-64 sm:w-72' : (isMobile ? 'w-0' : 'w-16')}
          bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 
          border-r border-gray-200 dark:border-gray-700
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Title and Toggle Button */}
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} h-14 sm:h-16 px-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0`}>
            {sidebarOpen && (
              <h1 className="text-base sm:text-xl font-bold text-blue-600 dark:text-blue-400 font-heading truncate">
                Admin Panel
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 flex-shrink-0"
            >
              {sidebarOpen ? <FiX size={18} className="sm:w-5 sm:h-5" /> : <FiMenu size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 ${sidebarOpen ? 'px-3 sm:px-4' : 'px-2'} py-4 sm:py-6 space-y-1.5 sm:space-y-2 overflow-y-auto`}>
            <button
              onClick={() => handleTabChange('overview')}
              className={`w-full flex items-center ${sidebarOpen ? 'px-3 sm:px-4 py-2.5 sm:py-3' : 'px-2.5 sm:px-3 py-2.5 sm:py-3 justify-center'} text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              title={!sidebarOpen ? 'Overview' : ''}
            >
              <FiBarChart size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
              {sidebarOpen && <span className="ml-2 sm:ml-3 truncate">Overview</span>}
            </button>
            
            <button
              onClick={() => handleTabChange('users')}
              className={`w-full flex items-center ${sidebarOpen ? 'px-3 sm:px-4 py-2.5 sm:py-3' : 'px-2.5 sm:px-3 py-2.5 sm:py-3 justify-center'} text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              title={!sidebarOpen ? 'All Users' : ''}
            >
              <FiUsers size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
              {sidebarOpen && <span className="ml-2 sm:ml-3 truncate">All Users</span>}
            </button>
            
            <button
              onClick={() => handleTabChange('payments')}
              className={`w-full flex items-center ${sidebarOpen ? 'px-3 sm:px-4 py-2.5 sm:py-3' : 'px-2.5 sm:px-3 py-2.5 sm:py-3 justify-center'} text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'payments'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              title={!sidebarOpen ? 'Payment Details' : ''}
            >
              <FiCreditCard size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
              {sidebarOpen && <span className="ml-2 sm:ml-3 truncate">Payment Details</span>}
            </button>
            
            <button
              onClick={() => handleTabChange('analytics')}
              className={`w-full flex items-center ${sidebarOpen ? 'px-3 sm:px-4 py-2.5 sm:py-3' : 'px-2.5 sm:px-3 py-2.5 sm:py-3 justify-center'} text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              title={!sidebarOpen ? 'Analytics' : ''}
            >
              <FiPieChart size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
              {sidebarOpen && <span className="ml-2 sm:ml-3 truncate">Analytics</span>}
            </button>
            
            <button
              onClick={() => handleTabChange('settings')}
              className={`w-full flex items-center ${sidebarOpen ? 'px-3 sm:px-4 py-2.5 sm:py-3' : 'px-2.5 sm:px-3 py-2.5 sm:py-3 justify-center'} text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              title={!sidebarOpen ? 'Settings' : ''}
            >
              <FiSettings size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
              {sidebarOpen && <span className="ml-2 sm:ml-3 truncate">Settings</span>}
            </button>
          </nav>

          {/* User Info & Logout */}
          <div className={`${sidebarOpen ? 'p-3 sm:p-4' : 'p-2'} border-t border-gray-200 dark:border-gray-700 flex-shrink-0`}>
            {sidebarOpen && (
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiUser className="text-white" size={16} />
                </div>
                <div className="ml-2 sm:ml-3 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{session.user.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">Administrator</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${sidebarOpen ? 'px-3 sm:px-4 py-2' : 'px-2.5 sm:px-3 py-2.5 sm:py-3 justify-center'} text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 rounded-lg transition-colors`}
              title={!sidebarOpen ? 'Logout' : ''}
            >
              <FiLogOut size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
              {sidebarOpen && <span className="ml-2 sm:ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${isMobile ? 'ml-0' : (sidebarOpen ? 'ml-64 sm:ml-72' : 'ml-16')}`}>
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 lg:hidden"
                  >
                    <FiMenu size={20} />
                  </button>
                )}
                
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 font-heading truncate">
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'users' && 'User Management'}
                  {activeTab === 'payments' && 'Payment Management'}
                  {activeTab === 'analytics' && 'Analytics & Reports'}
                  {activeTab === 'settings' && 'Admin Settings'}
                </h2>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6">
            <div className="space-y-6 sm:space-y-8">
              {activeTab === 'overview' && <AnalyticsDashboard />}
              {activeTab === 'users' && <UsersManagement />}
              {activeTab === 'payments' && <PaymentsManagement />}
              {activeTab === 'analytics' && <AnalyticsDashboard />}
              {activeTab === 'settings' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 font-heading">Admin Settings</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Admin settings and configuration options will be available here.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiLogOut, FiBarChart, FiUsers, FiCreditCard, FiPieChart, FiSettings, FiUser, FiMenu, FiX } from 'react-icons/fi';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import UsersManagement from '@/components/admin/UsersManagement';
import PaymentsManagement from '@/components/admin/PaymentsManagement';
import { Footer } from '@/components/Footer';
import Header from '@/components/Header';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative font-sans">
      {/* <Header/> */}
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 shadow-xl z-10 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-gray-200 dark:border-gray-700`}>
        <div className="flex flex-col h-full">
          {/* Logo/Title and Toggle Button */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} h-16 px-4 border-b border-gray-200 dark:border-gray-700`}>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 font-heading">
                Admin Panel
              </h1>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              {sidebarCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 ${sidebarCollapsed ? 'px-2' : 'px-4'} py-6 space-y-2`}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              title={sidebarCollapsed ? 'Overview' : ''}
            >
              <FiBarChart size={18} />
              {!sidebarCollapsed && <span className="ml-3">Overview</span>}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              title={sidebarCollapsed ? 'All Users' : ''}
            >
              <FiUsers size={18} />
              {!sidebarCollapsed && <span className="ml-3">All Users</span>}
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'payments'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              title={sidebarCollapsed ? 'Payment Details' : ''}
            >
              <FiCreditCard size={18} />
              {!sidebarCollapsed && <span className="ml-3">Payment Details</span>}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              title={sidebarCollapsed ? 'Analytics' : ''}
            >
              <FiPieChart size={18} />
              {!sidebarCollapsed && <span className="ml-3">Analytics</span>}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              title={sidebarCollapsed ? 'Settings' : ''}
            >
              <FiSettings size={18} />
              {!sidebarCollapsed && <span className="ml-3">Settings</span>}
            </button>
          </nav>

          {/* User Info & Logout */}
          <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200 dark:border-gray-700`}>
            {!sidebarCollapsed && (
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <FiUser className="text-white" size={18} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{session.user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-2'} text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 rounded-lg transition-colors`}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <FiLogOut size={16} />
              {!sidebarCollapsed && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content and Footer Container */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-heading">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'payments' && 'Payment Management'}
                {activeTab === 'analytics' && 'Analytics & Reports'}
                {activeTab === 'settings' && 'Admin Settings'}
              </h2>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6">
            <div className="space-y-8">
              {activeTab === 'overview' && <AnalyticsDashboard />}
              {activeTab === 'users' && <UsersManagement />}
              {activeTab === 'payments' && <PaymentsManagement />}
              {activeTab === 'analytics' && <AnalyticsDashboard />}
              {activeTab === 'settings' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-heading">Admin Settings</h3>
                  <p className="text-gray-600 dark:text-gray-400">Admin settings and configuration options will be available here.</p>
                </div>
              )}
            </div>
          </main>
        </div>

        
      </div>
    </div>
  );
}
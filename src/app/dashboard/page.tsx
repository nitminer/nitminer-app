'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProfileTab from '@/components/dashboard/ProfileTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import UsageTab from '@/components/dashboard/UsageTab';
import Header from '@/components/Header';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
      
      <Header/>
      <DashboardLayout>
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-zinc-700 mb-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'payments', label: 'Payments' },
            { id: 'usage', label: 'Usage' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-black transition ${
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
        {activeTab === 'usage' && <UsageTab />}
      </DashboardLayout>
    </>
  );
}
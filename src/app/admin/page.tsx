'use client';

import { useState } from 'react';
import OverviewTab from '@/components/admin/OverviewTab';
import UsersTab from '@/components/admin/UsersTab';
import PaymentsTab from '@/components/admin/PaymentsTab';
import SettingsTab from '@/components/admin/SettingsTab';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AdminLayout>
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-700 mb-8 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'Users' },
          { id: 'payments', label: 'Payments' },
          { id: 'settings', label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'payments' && <PaymentsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </AdminLayout>
  );
}

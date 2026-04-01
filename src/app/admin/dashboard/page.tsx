'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import OverviewTab from '@/components/admin/OverviewTab';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <OverviewTab />
    </AdminLayout>
  );
}

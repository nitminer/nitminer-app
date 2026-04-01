'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import PaymentsManagement from '@/components/admin/PaymentsManagement';

export default function AdminPaymentsPage() {
  return (
    <AdminLayout>
      <PaymentsManagement />
    </AdminLayout>
  );
}

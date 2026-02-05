'use client';

import PaymentsTab from '@/components/dashboard/PaymentsTab';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <PaymentsTab />
    </DashboardLayout>
  );
}
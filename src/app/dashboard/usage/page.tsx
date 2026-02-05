'use client';

import UsageTab from '@/components/dashboard/UsageTab';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function UsagePage() {
  return (
    <DashboardLayout>
      <UsageTab />
    </DashboardLayout>
  );
}
'use client';

import ActivityTab from '@/components/dashboard/ActivityTab';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ActivityPage() {
  return (
    <DashboardLayout>
      <ActivityTab />
    </DashboardLayout>
  );
}
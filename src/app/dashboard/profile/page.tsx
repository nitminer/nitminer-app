'use client';

import ProfileTab from '@/components/dashboard/ProfileTab';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <ProfileTab />
    </DashboardLayout>
  );
}
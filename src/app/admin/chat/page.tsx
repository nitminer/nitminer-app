'use client';

import LiveSupportPanel from '@/components/admin/LiveSupportPanel';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

export default function AdminChatPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session || session.user?.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
      setIsAuthorized(true);
    };
    checkAuth();
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Live Support Chat
          </h1>
          <p className="text-gray-600 mt-2">
            Respond to user support requests in real-time. Chat will be automatically deleted after closing.
          </p>
        </div>
        <LiveSupportPanel />
      </div>
    </div>
  );
}

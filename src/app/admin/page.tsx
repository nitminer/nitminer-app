'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AdminRootPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (String(session?.user?.role || '').toLowerCase() === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/admin/login');
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050506] text-white">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-bold">Opening admin panel...</span>
      </div>
    </div>
  );
}

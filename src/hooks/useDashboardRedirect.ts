import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to handle dashboard redirects based on user role
 * Redirects admins to /admin/dashboard and regular users to /dashboard
 */
export function useDashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) return;

    const dashboardUrl = session.user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    
    // Only redirect if we're on the home page or login page
    if (window.location.pathname === '/' || window.location.pathname === '/login') {
      router.push(dashboardUrl);
    }
  }, [session, status, router]);

  return {
    dashboardUrl: session?.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard',
    isAdmin: session?.user?.role === 'admin',
    session,
    status,
  };
}

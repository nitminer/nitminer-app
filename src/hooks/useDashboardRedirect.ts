import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to handle dashboard redirects based on user role
 * Redirects admins to /admin/dashboard and regular users to /dashboard
 * Improved for mobile device support
 */
export function useDashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const redirectAttemptedRef = useRef(false);

  useEffect(() => {
    // Still loading session
    if (status === 'loading') return;

    // No user logged in
    if (!session?.user) return;

    const dashboardUrl = session.user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    const currentPathname = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // Check if we should redirect (on home or login page)
    const shouldRedirect = currentPathname === '/' || currentPathname === '/login';
    
    if (shouldRedirect && !redirectAttemptedRef.current) {
      redirectAttemptedRef.current = true;
      
      console.log('[useDashboardRedirect] Redirecting to:', dashboardUrl, 'from:', currentPathname);
      
      // Use router.push with a fallback to window.location for mobile
      try {
        router.push(dashboardUrl);
      } catch (err) {
        console.warn('[useDashboardRedirect] router.push failed, using window.location:', err);
        window.location.href = dashboardUrl;
      }
    }
  }, [session, status, router]);

  return {
    dashboardUrl: session?.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard',
    isAdmin: session?.user?.role === 'admin',
    session,
    status,
  };
}

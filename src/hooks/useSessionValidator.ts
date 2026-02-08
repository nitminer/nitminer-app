import { useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';

/**
 * Hook to monitor session validity and detect if session is invalidated
 * Automatically logs out the user if their session is invalidated from another device
 * Works across subdomains via HTTP cookies
 */
export function useSessionValidator() {
  const { data: session, status } = useSession();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Validate session periodically
  const validateSession = useCallback(async () => {
    // Session is managed via HTTP cookies automatically by NextAuth
    // This function validates that the session is still valid on the server
    
    if (!session?.user?.email) return;

    try {
      // Get session token from localStorage if available
      const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
      
      const response = await fetch('/api/auth/session/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionToken: sessionToken || null,
          email: session.user.email 
        }),
        // Credentials are automatically sent with the request due to HTTP cookies
        credentials: 'include',
      });

      if (!response.ok) {
        // If endpoint not accessible, skip validation
        console.warn('Session validation endpoint returned status:', response.status);
        return;
      }

      const data = await response.json();

      if (data.isValid === false) {
        // Session is invalid, log out the user
        console.log('Session invalidated:', data.reason);
        await signOut({ redirect: true, callbackUrl: '/login' });
      }
    } catch (error) {
      console.warn('Session validation warning (non-critical):', error);
      // Don't let validation errors prevent normal operation
    }
  }, [session]);

  // Set up periodic validation
  useEffect(() => {
    if (status === 'authenticated') {
      // Check session every 5 minutes
      validateSession();
      checkIntervalRef.current = setInterval(validateSession, 5 * 60 * 1000);

      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
      };
    }
  }, [status, validateSession]);

  return { validateSession };
}

/**
 * Hook to listen for session invalidation across tabs/windows
 * Detects when session is invalidated from another tab and logs out user
 */
export function useStorageSessionListener() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;

    // Use BroadcastChannel for cross-tab communication (if supported)
    let channel: BroadcastChannel | null = null;

    try {
      channel = new BroadcastChannel('auth');
      channel.onmessage = (event) => {
        if (event.data.type === 'logout') {
          console.log('Session invalidated from another tab');
          signOut({ redirect: true, callbackUrl: '/login' });
        }
      };
    } catch (e) {
      // BroadcastChannel not supported, fall back to storage events
      const handleStorageChange = async (e: StorageEvent) => {
        // If session was invalidated from another tab
        if (e.key === 'session_invalidated' && e.newValue === 'true') {
          console.log('Session invalidated from another tab');
          localStorage.removeItem('session_invalidated');
          await signOut({ redirect: true, callbackUrl: '/login' });
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }

    return () => {
      if (channel) {
        channel.close();
      }
    };
  }, [status]);
}

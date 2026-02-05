import { useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';

/**
 * Hook to monitor session validity and detect if session is invalidated
 * Automatically logs out the user if their session is invalidated from another device
 */
export function useSessionValidator() {
  const { data: session, status } = useSession();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTokenRef = useRef<string | null>(null);

  // Store session token from localStorage when login happens
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      const storedToken = localStorage.getItem('session_token');
      if (storedToken) {
        sessionTokenRef.current = storedToken;
      }
    }
  }, [session, status]);

  // Validate session periodically
  const validateSession = useCallback(async () => {
    const token = sessionTokenRef.current || localStorage.getItem('session_token');
    
    if (!token) return;

    try {
      const response = await fetch('/api/auth/session/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: token }),
      });

      const data = await response.json();

      if (!data.isValid) {
        // Session is invalid, log out the user
        console.log('Session invalidated:', data.reason);
        localStorage.removeItem('session_token');
        await signOut({ redirect: true, callbackUrl: '/login' });
      }
    } catch (error) {
      console.error('Session validation error:', error);
    }
  }, []);

  // Set up periodic validation
  useEffect(() => {
    if (status === 'authenticated' && sessionTokenRef.current) {
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
 * Hook to listen for storage changes across tabs/windows
 * Detects when another tab has invalidated the session
 */
export function useStorageSessionListener() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;

    const handleStorageChange = async (e: StorageEvent) => {
      // If session token was removed from another tab
      if (e.key === 'session_token' && e.newValue === null) {
        console.log('Session token removed from storage');
        await signOut({ redirect: true, callbackUrl: '/login' });
      }

      // If session status was changed
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
  }, [status]);
}

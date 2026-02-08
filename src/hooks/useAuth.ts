import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function useAuth() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Check authentication status from NextAuth session
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (status === 'authenticated' && session?.user) {
      setIsAuthenticated(true);
      setUser(session.user);
      setHasChecked(true);
      setIsLoading(false);
      return;
    }

    // Check for stored session data as fallback
    try {
      const storedSession = localStorage.getItem('nitminer_session') || sessionStorage.getItem('nitminer_session');
      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        if (sessionData.user && sessionData.expires) {
          const expiresAt = new Date(sessionData.expires);
          if (expiresAt > new Date()) {
            setIsAuthenticated(true);
            setUser(sessionData.user);
            setHasChecked(true);
            setIsLoading(false);
            return;
          } else {
            // Clear expired session
            localStorage.removeItem('nitminer_session');
            sessionStorage.removeItem('nitminer_session');
            localStorage.removeItem('user_email');
            sessionStorage.removeItem('user_email');
          }
        }
      }
    } catch (error) {
      console.warn('Error checking stored session:', error);
    }

    // Not authenticated
    setIsAuthenticated(false);
    setUser(null);
    setHasChecked(true);
    setIsLoading(false);
  }, [status, session]);

  const logout = () => {
    // Clear NextAuth session
    // Note: signOut should be called from component level
    
    // Clear stored session data
    localStorage.removeItem('nitminer_session');
    sessionStorage.removeItem('nitminer_session');
    localStorage.removeItem('user_email');
    sessionStorage.removeItem('user_email');
    localStorage.removeItem('auth_token');
    
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    hasChecked,
    logout,
  };
}

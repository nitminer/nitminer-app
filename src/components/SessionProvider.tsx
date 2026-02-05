'use client';

import { useEffect, ReactNode } from 'react';
import { useSessionValidator, useStorageSessionListener } from '@/hooks/useSessionValidator';

interface SessionProviderProps {
  children: ReactNode;
}

/**
 * SessionProvider component that adds session validation and monitoring
 * Wrap your app with this to enable automatic session invalidation
 */
export function SessionProvider({ children }: SessionProviderProps) {
  const { validateSession } = useSessionValidator();
  useStorageSessionListener();

  useEffect(() => {
    // Initial validation on mount
    validateSession();
  }, [validateSession]);

  return <>{children}</>;
}

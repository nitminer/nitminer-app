'use client';

import { ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

/**
 * SessionProvider component wrapper - NextAuth session is managed by NextAuthSessionProvider
 */
export function SessionProvider({ children }: SessionProviderProps) {
  return <>{children}</>;
}

"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider } from "@/components/SessionProvider";

export function Providers({ children }) {
  return (
    <NextAuthSessionProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </NextAuthSessionProvider>
  );
}
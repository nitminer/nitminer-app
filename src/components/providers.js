"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider } from "@/components/SessionProvider";

export function Providers({ children }) {
  return (
    <NextAuthSessionProvider>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </SessionProvider>
    </NextAuthSessionProvider>
  );
}
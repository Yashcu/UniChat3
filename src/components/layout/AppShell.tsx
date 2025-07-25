"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { MessagingProvider } from "@/contexts/messaging/MessagingProvider";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import AuthErrorFallback from "@/components/ErrorFallbacks/AuthErrorFallback";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppErrorBoundary fallback={<AuthErrorFallback />}>
          <MessagingProvider>
            <AppErrorBoundary key={pathname}>{children}</AppErrorBoundary>
          </MessagingProvider>
        </AppErrorBoundary>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

"use client";

import { AuthProvider, RequireAuth } from "@/components/auth";
import { AppShell } from "@/components/appshell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RequireAuth>
        <AppShell>{children}</AppShell>
      </RequireAuth>
    </AuthProvider>
  );
}

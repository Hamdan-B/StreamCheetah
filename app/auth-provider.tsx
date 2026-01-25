"use client";

import { createAuthProvider } from "@/lib/supabaseAuth";

const AuthProvider = createAuthProvider();

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

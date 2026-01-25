"use client";

import { DatabaseProvider } from "@/contexts/databaseContext";
import { createAuthProvider } from "@/lib/supabaseAuth";
import { ThemeProvider } from "@/contexts/themeContext";

const AuthProvider = createAuthProvider();

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DatabaseProvider>{children}</DatabaseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

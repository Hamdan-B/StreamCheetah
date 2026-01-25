import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  createClient,
  SupabaseClient,
  User,
  Session,
} from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  supabaseClient: SupabaseClient | null;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSupabaseAuth must be used within an AuthProvider");
  }
  return context;
};

export const createAuthProvider = () => {
  return function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(
      null,
    );

    useEffect(() => {
      const initializeAuth = async () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          console.error("Missing Supabase environment variables");
          setIsLoading(false);
          return;
        }

        const client = createClient(supabaseUrl, supabaseAnonKey);
        setSupabaseClient(client);

        const setAuthCookies = (session: Session | null) => {
          const expiresInSeconds = session?.expires_at
            ? session.expires_at - Math.floor(Date.now() / 1000)
            : 60 * 60 * 24 * 7;

          const setCookie = (name: string, value: string, maxAge: number) => {
            document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
          };

          if (!session) {
            setCookie("sb-access-token", "", 0);
            setCookie("sb-refresh-token", "", 0);
            return;
          }

          setCookie("sb-access-token", session.access_token, expiresInSeconds);
          setCookie(
            "sb-refresh-token",
            session.refresh_token,
            expiresInSeconds,
          );
        };

        const {
          data: { session },
        } = await client.auth.getSession();
        setUser(session?.user ?? null);
        setAuthCookies(session ?? null);
        setIsLoading(false);

        const {
          data: { subscription },
        } = client.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY") {
            // CRITICAL: Stop the auto-redirect by ensuring state is set
            // but the page stays on /auth/reset-password
            setUser(session?.user ?? null);
            setAuthCookies(session ?? null);
            return;
          }

          if (
            event === "SIGNED_IN" ||
            event === "TOKEN_REFRESHED" ||
            event === "USER_UPDATED"
          ) {
            setUser(session?.user ?? null);
            setAuthCookies(session ?? null);
          }

          if (event === "SIGNED_OUT") {
            setUser(null);
            setAuthCookies(null);
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      };

      initializeAuth();
    }, []);

    const signUp = useCallback(
      async (email: string, password: string) => {
        if (!supabaseClient) return { error: "Auth client not initialized" };
        const { error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        return { error: error?.message || null };
      },
      [supabaseClient],
    );

    const signIn = useCallback(
      async (email: string, password: string) => {
        if (!supabaseClient) return { error: "Auth client not initialized" };
        const { error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        return { error: error?.message || null };
      },
      [supabaseClient],
    );

    const resetPassword = useCallback(
      async (email: string) => {
        if (!supabaseClient) return { error: "Auth client not initialized" };
        const { error } = await supabaseClient.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          },
        );
        return { error: error?.message || null };
      },
      [supabaseClient],
    );

    const signOut = useCallback(async () => {
      if (!supabaseClient) return;
      await supabaseClient.auth.signOut();
      document.cookie = "sb-access-token=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "sb-refresh-token=; path=/; max-age=0; SameSite=Lax";
      setUser(null);
    }, [supabaseClient]);

    const value: AuthContextType = {
      user,
      isLoading,
      supabaseClient,
      signUp,
      signIn,
      resetPassword,
      signOut,
    };

    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
  };
};

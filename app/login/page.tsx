"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/lib/supabaseAuth";
import { Button } from "@/components/button/button";
import { LoadingSpinner } from "@/components/loading";
import { ErrorMessage, SuccessMessage } from "@/components/errorMessage";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, signIn, signUp, resetPassword } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isPasswordResetMode, setIsPasswordResetMode] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      router.push("/createStreamUser");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    try {
      if (isLoginMode) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error);
        } else {
          router.push("/createStreamUser");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error);
        } else {
          setMessage("Check your email to confirm your account");
          setEmail("");
          setPassword("");
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Enter your email to reset your password");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error);
      } else {
        setIsPasswordResetMode(true);
        setMessage(
          `Password reset email sent to ${email}. Check your inbox and follow the link.`,
        );
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20">
      <div className="flex flex-col items-center space-y-6 bg-card border border-border rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        {/* Logo Placeholder */}
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-lg">
          S
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            StreamCheetah
          </h1>
          <p className="text-muted-foreground">
            {isLoginMode ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        <ErrorMessage error={error} />
        <SuccessMessage message={message} />

        {!isPasswordResetMode ? (
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all"
                placeholder="you@example.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                {isLoginMode && (
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
                    disabled={isSubmitting}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all"
                placeholder="••••••••"
                required
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Loading...
                </>
              ) : isLoginMode ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        ) : (
          <Button
            type="button"
            variant="primary"
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all"
            onClick={() => {
              setIsPasswordResetMode(false);
              setMessage("");
              setError("");
            }}
          >
            Back to Sign In
          </Button>
        )}

        <div className="w-full pt-6 border-t border-border">
          <p className="text-center text-muted-foreground text-sm">
            {isLoginMode
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError("");
                setMessage("");
              }}
              className="text-primary font-semibold hover:text-primary/80 hover:underline transition-colors"
              disabled={isSubmitting}
            >
              {isLoginMode ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}

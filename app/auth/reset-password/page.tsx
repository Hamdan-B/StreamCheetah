"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/lib/supabaseAuth";
import { Button } from "@/components/button/button";
import { LoadingSpinner } from "@/components/loading";
import { ErrorMessage, SuccessMessage } from "@/components/errorMessage";

export default function ResetPasswordPage() {
  const router = useRouter();
  const {
    supabaseClient,
    user,
    isLoading: authLoading,
    signOut,
  } = useSupabaseAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If auth has finished loading and there's no user session,
    // the reset link was likely invalid or expired.
    if (!authLoading && !user) {
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!supabaseClient) throw new Error("Auth client not initialized");

      const { error: updateError } = await supabaseClient.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage("Password reset successfully! Redirecting to login...");
        // Sign out the user so they need to log in with new password
        await signOut();
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Verifying session...</p>
      </div>
    );
  }

  return (
    <section className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20">
      <div className="flex flex-col items-center space-y-6 bg-card border border-border rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        {/* Logo Placeholder */}
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-lg">
          S
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Reset Password
          </h1>
          <p className="text-muted-foreground">Enter your new password</p>
        </div>

        <ErrorMessage error={error} />
        <SuccessMessage message={message} />

        {user && !message && (
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all"
                placeholder="••••••••"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                At least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}

        <div className="w-full pt-6 border-t border-border text-center">
          <button
            onClick={() => router.push("/login")}
            className="text-primary font-semibold hover:text-primary/80 hover:underline text-sm transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </section>
  );
}

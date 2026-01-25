"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/lib/supabaseAuth";

export default function AuthCallback() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/createStreamUser");
    } else if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <p>Verifying email...</p>
    </div>
  );
}

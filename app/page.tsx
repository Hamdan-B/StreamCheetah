"use client";

import { redirect } from "next/navigation";
import { useSupabaseAuth } from "@/lib/supabaseAuth";

export default function Home() {
  const { user, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect("/login");
  }

  redirect("/app");
}

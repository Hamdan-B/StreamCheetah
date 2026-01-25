"use client";

import NavigationBar from "@/components/navigationBar/navigationBar";
import { useSupabaseAuth } from "@/lib/supabaseAuth";

export default function NavWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useSupabaseAuth();

  return (
    <>
      {user ? <NavigationBar /> : null}
      {children}
    </>
  );
}

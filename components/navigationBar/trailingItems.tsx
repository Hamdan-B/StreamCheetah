"use client";

import { Button } from "../button/button";
import { Mail, User } from "../icons";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/lib/supabaseAuth";

export default function TrailingItems() {
  const router = useRouter();
  const { user, signOut } = useSupabaseAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex items-center gap-3">
      {/* <Button
        variant="secondary"
        className="p-2 rounded-lg bg-transparent hover:bg-muted text-foreground transition-colors"
        onClick={() => router.push("/")}
      >
        <Mail />
      </Button> */}
      {!user ? (
        <Button
          variant="primary"
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
          onClick={() => router.push("/login")}
        >
          Log In
        </Button>
      ) : (
        <Button
          variant="secondary"
          className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold transition-colors"
          onClick={handleLogout}
        >
          Log Out
        </Button>
      )}

      <Button
        variant="icon"
        className="p-2 rounded-lg hover:bg-muted text-foreground transition-colors"
        onClick={() => router.push("/app/dashboard")}
      >
        <User />
      </Button>
    </div>
  );
}

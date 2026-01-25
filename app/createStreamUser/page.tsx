"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createStreamUser } from "../actions";
import { useDatabase } from "@/contexts/databaseContext";
import { useSupabaseAuth } from "@/lib/supabaseAuth";

export type UserObject = {
  userId: string;
  email: string;
  imageUrl?: string;
  fullName?: string;
};

export default function CreateStreamUser() {
  const router = useRouter();
  const [creationOngoing, setCreationOngoing] = useState(true);
  const { user, supabaseClient } = useSupabaseAuth();
  const { setSupabaseClient, getUserData, setUserData } = useDatabase();
  const creationStarted = useRef(false);

  useEffect(() => {
    const createStreamUserOnServer = async () => {
      if (creationStarted.current) return; // avoid double-running in strict/dev
      creationStarted.current = true;

      // Wait until Supabase auth has loaded user
      if (!user) return;

      const userEmail = user.email;
      if (!userEmail) {
        console.error("[createStreamUser] No email address found.");
        return;
      }

      const userObject: UserObject = {
        userId: user.id,
        email: userEmail,
        imageUrl: undefined, // No image from auth
        fullName: user.user_metadata?.full_name ?? undefined,
      };

      // Create in Stream.io
      await createStreamUser(userObject);

      // Also create/check in Supabase
      try {
        // Get session token for Supabase client
        const session = await supabaseClient?.auth.getSession();
        if (session?.data.session?.access_token) {
          await setSupabaseClient(session.data.session.access_token);
        }

        // Check if user already exists in Supabase
        const existingUser = await getUserData(user.id, "user_id");

        if (!existingUser) {
          // Create a default username from email or full name
          const defaultUsername =
            user.user_metadata?.full_name?.replace(/\s+/g, "_").toLowerCase() ||
            userEmail.split("@")[0];

          // Create user in Supabase
          await setUserData(
            defaultUsername,
            "", // No avatar yet, user must upload in onboarding
            userEmail,
            "2000-01-01", // Default date of birth
            user.id,
          );
          console.log("[createStreamUser] User created in Supabase");
        } else {
          console.log("[createStreamUser] User already exists in Supabase");
        }
      } catch (error) {
        console.error(
          "[createStreamUser] Error creating Supabase user:",
          error,
        );
        // Continue anyway, user can complete onboarding later
      }

      setCreationOngoing(false);
    };
    createStreamUserOnServer();
  }, [user, supabaseClient, setSupabaseClient, getUserData, setUserData]);

  useEffect(() => {
    if (!creationOngoing) {
      router.replace("/app");
    }
  }, [creationOngoing, router]);

  if (creationOngoing) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <h1>Creating a new user...</h1>
      </div>
    );
  }

  return null;
}

"use client";

import { useDatabase } from "@/contexts/databaseContext";
import { useSupabaseAuth } from "@/lib/supabaseAuth";
import { useEffect, useState } from "react";
import { Tables } from "@/database/database.types";
import HomeFeed from "@/components/homeFeed/homeFeed";
import LiveChannels from "@/components/liveChannels/liveChannels";

export default function BrowsePage() {
  const { user, supabaseClient } = useSupabaseAuth();
  const { supabase, setSupabaseClient, getLivestreams } = useDatabase();
  const [livestreams, setLivestreams] = useState<Tables<"livestreams">[]>([]);

  useEffect(() => {
    async function initializeSupabase() {
      if (supabaseClient && supabase) {
        return;
      }
      const session = await supabaseClient?.auth.getSession();
      if (session?.data.session?.access_token && !supabase) {
        await setSupabaseClient(session.data.session.access_token);
      }
    }

    if (user && supabaseClient) {
      initializeSupabase();
    }
  }, [user, supabaseClient, supabase, setSupabaseClient]);

  useEffect(() => {
    console.log("[BrowsePage] useEffect triggered, supabase:", !!supabase);
    if (supabase) {
      console.log("[BrowsePage] Calling getLivestreams...");
      (async () => {
        try {
          const allStreams = await getLivestreams();
          console.log(
            "[BrowsePage] getLivestreams returned:",
            allStreams.length,
            "livestreams",
          );
          setLivestreams(allStreams);
        } catch (error) {
          console.error("[BrowsePage] Error:", error);
        }
      })();
    }
  }, [supabase, getLivestreams]);

  return (
    <div className="grid h-screen grid-cols-[auto_1fr]">
      <LiveChannels livestreams={livestreams} />
      <div className="flex-1 overflow-hidden">
        <HomeFeed livestreams={livestreams} />
      </div>
    </div>
  );
}

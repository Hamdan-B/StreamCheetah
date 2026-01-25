"use client";

import { useDatabase } from "@/contexts/databaseContext";
import { useSupabaseAuth } from "@/lib/supabaseAuth";
import { useEffect, useState } from "react";
import Onboarding from "@/components/onboarding/onboarding";
import SelectInterests from "@/components/onboarding/selectInterests";
import { useRouter } from "next/navigation";
import { Browse, GoLive, Settings } from "@/components/icons";

export default function AppPage() {
  const router = useRouter();
  const { user, supabaseClient } = useSupabaseAuth();
  const { supabase, setSupabaseClient, getUserData } = useDatabase();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSelectInterests, setShowSelectInterests] = useState(false);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowSelectInterests(true);
  };

  const handleInterestsComplete = async () => {
    setShowSelectInterests(false);
  };

  useEffect(() => {
    const initializeSupabase = async () => {
      if (supabaseClient && !supabase) {
        const { data } = await supabaseClient.auth.getSession();
        if (data.session?.access_token) {
          await setSupabaseClient(data.session.access_token);
        }
      }
    };

    if (user && supabaseClient && !supabase) {
      initializeSupabase();
    }
  }, [user, supabaseClient, supabase, setSupabaseClient]);

  useEffect(() => {
    if (supabase && user?.id) {
      getUserData(user.id).then((userData) => {
        if (userData) {
          if (userData.interests.length === 0) {
            setShowOnboarding(false);
            setShowSelectInterests(true);
          } else {
            setShowOnboarding(false);
            setShowSelectInterests(false);
          }
        } else {
          setShowOnboarding(true);
        }
      });
    }
  }, [supabase, user?.id, getUserData]);

  if (showOnboarding)
    return <Onboarding onComplete={handleOnboardingComplete} />;

  if (showSelectInterests)
    return <SelectInterests onComplete={handleInterestsComplete} />;

  return (
    <div className="w-full h-full bg-background text-foreground overflow-y-auto scrollbar-hide">
      <div className="relative bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 border-b border-muted min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between gap-12 w-full">
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              Welcome to StreamCheetah
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              Discover live streams from talented creators, connect with your
              favorite streamers, and share your own content with the world.
              Start streaming today and build your community.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => router.push("/browse")}
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-colors text-lg flex items-center gap-2"
              >
                <Browse />
                Browse Streams
              </button>
              <button
                onClick={() => router.push("/app/dashboard")}
                className="px-8 py-4 bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-lg transition-colors text-lg flex items-center gap-2"
              >
                <GoLive />
                Go Live
              </button>
            </div>
          </div>
          <div className="flex-1 hidden md:flex items-center justify-center">
            <div className="relative w-96 h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/30 to-accent/30 shadow-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-primary/40 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <svg
                    className="w-16 h-16 text-primary"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-foreground font-bold text-2xl mb-2">
                  Start Streaming
                </p>
                <p className="text-muted-foreground text-lg">
                  Reach thousands of viewers instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

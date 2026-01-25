"use client";

import dynamicImport from "next/dynamic";
import Image from "next/image";
import { useDatabase } from "@/contexts/databaseContext";
import { Tables } from "@/database/database.types";
import { useSupabaseAuth } from "@/lib/supabaseAuth";
import {
  Call,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/button/button";
import InterestComponent from "@/components/onboarding/interestComponent";
import LivestreamWatching from "@/components/livestreamWatching/livestreamWatching";
import { getClient } from "@/lib/streamClient";
import { createToken } from "@/app/actions";

const MyChat = dynamicImport(() => import("@/components/myChat/myChat"), {
  ssr: false,
});

export default function UserPage({
  params,
}: {
  params: Promise<{ user: string }>;
}) {
  const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(
    null,
  );
  const [streamerData, setStreamerData] = useState<Tables<"users"> | null>(
    null,
  );
  const [call, setCall] = useState<Call | null>(null);
  const { user, supabaseClient } = useSupabaseAuth();
  const { supabase, getUserData, setSupabaseClient, followUser } =
    useDatabase();
  const { user: streamerName } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<string | undefined>();
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [isStreamerLive, setIsStreamerLive] = useState(false);

  useEffect(() => {
    const joinCall = async () => {
      if (!streamClient || !streamerData || !isStreamerLive) {
        return;
      }
      try {
        const call = streamClient.call("livestream", streamerName);
        await call.join();
        setCall(call);
        setIsLoading(false);
      } catch (error) {
        console.error("[UserPage] Error joining call:", error);
        setIsLoading(false);
      }
    };
    joinCall();
  }, [streamClient, streamerName, streamerData, isStreamerLive]);

  useEffect(() => {
    const initializeStreamClient = async () => {
      if (streamClient || !user?.id) {
        return;
      }
      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      if (!apiKey) {
        throw new Error("NEXT_PUBLIC_STREAM_API_KEY is not set");
      }
      const userId = user.id;
      const client = getClient({
        apiKey: apiKey,
        user: {
          id: userId,
        },
        userToken: await createToken(userId),
      });
      setStreamClient(client);
    };
    initializeStreamClient();
  }, [user?.id, streamClient]);

  useEffect(() => {
    // Initialize all necessary clients
    const initializeClients = async () => {
      if (!user?.id) {
        return;
      }

      if (!supabase) {
        const session = await supabaseClient?.auth.getSession();
        if (session?.data.session?.access_token) {
          await setSupabaseClient(session.data.session.access_token);
        }
        return;
      }

      const userData = await getUserData(streamerName, "user_name");
      if (!userData) {
        console.error("[UserPage] User data not found for:", streamerName);
        return;
      }
      setStreamerData(userData);

      const { data: livestreamRecord, error: livestreamError } = await supabase
        .from("livestreams")
        .select("chat_session_id, is_live")
        .eq("user_name", streamerName)
        .eq("is_live", true)
        .maybeSingle();

      if (livestreamError && livestreamError.code !== "PGRST116") {
        console.error(
          "[UserPage] Error fetching current livestream:",
          livestreamError,
        );
      }

      if (livestreamRecord?.chat_session_id) {
        setChatSessionId(livestreamRecord.chat_session_id);
      } else {
        setChatSessionId(streamerName);
      }
      setIsStreamerLive(!!livestreamRecord?.is_live);

      // Check if current user is following the streamer
      const currentUserData = await getUserData(user.id, "user_id");
      if (currentUserData && userData.user_id) {
        setIsFollowing(currentUserData.following.includes(userData.user_id));
      }
      setCurrentUserData(currentUserData?.user_name);

      if (!livestreamRecord) {
        setIsLoading(false);
      }
    };
    initializeClients();
  }, [
    user,
    supabase,
    setSupabaseClient,
    getUserData,
    streamerName,
    supabaseClient,
  ]);

  const handleFollow = async () => {
    if (!user?.id || !streamerData) {
      console.error("[UserPage] handleFollow] Missing user or streamer data");
      return;
    }

    // Prevent users from following themselves
    if (user.id === streamerName) {
      return;
    }

    setIsFollowLoading(true);
    try {
      const success = await followUser(user.id, streamerData.user_id);
      if (success) {
        setIsFollowing(!isFollowing);
        // Refresh streamer data to update follower count
        const updatedStreamerData = await getUserData(
          streamerName,
          "user_name",
        );
        if (updatedStreamerData) {
          setStreamerData(updatedStreamerData);
        }
      }
    } catch (error) {
      console.error("[UserPage] handleFollow] Error following user:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <div
      className={`h-full grid gap-0 ${isStreamerLive ? "grid-cols-2" : "grid-cols-1"}`}
    >
      <div className="overflow-y-auto">
        <section className="min-h-72 max-h-[500px] w-full">
          {isLoading && (
            <div className="h-full w-full flex items-center justify-center text-2xl">
              <p>Loading...</p>
            </div>
          )}
          {!isLoading && (!call || call.state.backstage) && (
            <div className="flex items-center justify-center min-h-72 max-h-[500px] w-full bg-gradient-to-r from-twitch-purple via-violet-400 to-twitch-purple">
              <div className="text-center text-white opacity-80 mix-blend-dark-light">
                <h1 className="text-4xl font-extrabold drop-shadow-lg">
                  Stream Offline
                </h1>
                <p className="mt-2 text-lg drop-shadow-md">
                  {streamerData?.user_name} is not currently streaming. Check
                  back later!
                </p>
              </div>
            </div>
          )}
          {!isLoading && streamClient && call && !call.state.backstage && (
            <StreamTheme>
              <StreamVideo client={streamClient}>
                <StreamCall call={call}>
                  <LivestreamWatching />
                </StreamCall>
              </StreamVideo>
            </StreamTheme>
          )}
        </section>
        {streamerData && (
          <section className="space-y-4">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <Image
                  src={streamerData.image_url}
                  alt={streamerData.user_name}
                  width={60}
                  height={60}
                  className="rounded-full"
                />

                <div>
                  <h2 className="text-xl font-bold">
                    {streamerData.user_name}
                  </h2>
                  <p>{streamerData.followers.length} followers</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {user?.id !== streamerName && (
                  <Button
                    variant="primary"
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                  >
                    {isFollowLoading
                      ? "Following..."
                      : isFollowing
                        ? "Unfollow"
                        : "Follow"}
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 space-y-2">
              <h2 className="text-2xl font-bold">Interests</h2>
              <div className="flex flex-wrap gap-3">
                {streamerData.interests.map((interest, index) => (
                  <span
                    key={`${interest}-${index}`}
                    className="px-3 py-2 rounded-lg bg-muted text-foreground ring-1 ring-border hover:ring-primary transition-colors"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 space-y-2">
              <h2 className="text-2xl font-bold">Following</h2>
              {streamerData.following.length === 0 && (
                <p>{streamerData.user_name} is not following anyone</p>
              )}
              {streamerData.following.map((following, index) => (
                <div key={`${following}-${index}`}>
                  <p>{following}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      {isStreamerLive && (
        <section className="overflow-y-auto border-l">
          {user?.id && currentUserData && (
            <MyChat
              userId={user.id}
              userName={streamerName}
              isStreamer={false}
              channelId={chatSessionId ?? streamerName}
            />
          )}
        </section>
      )}
    </div>
  );
}

"use client";

import dynamicImport from "next/dynamic";

const StreamerViewComponent = dynamicImport(
  () => import("@/components/streamerView/streamerView"),
  { ssr: false },
);

const MyChat = dynamicImport(() => import("@/components/myChat/myChat"), {
  ssr: false,
});

import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  Call,
  StreamTheme,
  User,
} from "@stream-io/video-react-sdk";
import { useState, useEffect, useRef } from "react";
import { useDatabase } from "@/contexts/databaseContext";
import { useSupabaseAuth } from "@/lib/supabaseAuth";
import { getClient } from "@/lib/streamClient";
import { createToken } from "@/app/actions";
import type { MyChatRef } from "@/components/myChat/myChat";

export default function Dashboard() {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user, supabaseClient } = useSupabaseAuth();
  const { supabase, getUserData, setSupabaseClient } = useDatabase();

  const [chatExpanded, setChatExpanded] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const myChatRef = useRef<MyChatRef>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  // Redirect unauthenticated users away from dashboard
  useEffect(() => {
    if (!user) {
      window.location.replace("/login");
    }
  }, [user]);

  useEffect(() => {
    const enterCall = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
        if (!apiKey) {
          console.error("NEXT_PUBLIC_STREAM_API_KEY is not set");
          setError("Stream API key is not configured");
          return;
        }
        const userId = user?.id;
        if (!userId) {
          setError("User ID not found");
          return;
        }
        if (!supabase) {
          const session = await supabaseClient?.auth.getSession();
          if (session?.data.session?.access_token) {
            console.log(
              "[Dashboard] Setting supabase client with token: ",
              session.data.session.access_token,
            );
            await setSupabaseClient(session.data.session.access_token);
            return;
          }
        }
        if (client && call) {
          setIsLoading(false);
          return;
        }
        const userData = await getUserData(userId);
        if (!userData) {
          console.error("User data not found");
          setError("Could not load user data");
          return;
        }
        const callId = userData.user_name.toLowerCase();
        const token = await createToken(userId);
        const streamUser: User = {
          id: userId,
          name: userData.user_name,
        };

        const streamClient = getClient({
          apiKey: apiKey,
          user: streamUser,
          userToken: token,
        });
        const streamCall = streamClient.call("livestream", callId);
        await streamCall.join({ create: true });
        setClient(streamClient);
        setCall(streamCall);
        setUserName(userData.user_name);
        setIsLoading(false);
      } catch (error) {
        console.error("[Dashboard] Error entering call:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(`Failed to start stream: ${errorMessage}`);
        setIsLoading(false);
      }
    };
    enterCall();
  }, [
    user,
    getUserData,
    supabase,
    setSupabaseClient,
    client,
    call,
    supabaseClient,
  ]);

  return (
    <section
      className={`grid h-screen bg-background gap-4 p-4 ${chatExpanded ? "grid-cols-3" : "grid-cols-1"}`}
    >
      {error ? (
        <div className="flex flex-col items-center justify-center h-full bg-background text-foreground p-6">
          <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-error"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0 0v2m0-6a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Unable to Start Stream</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center h-full bg-background text-foreground col-span-full">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Starting your stream...</p>
        </div>
      ) : client && call ? (
        <>
          <div
            className={`${chatExpanded ? "col-span-2" : "col-span-1"} overflow-hidden rounded-lg`}
          >
            <StreamTheme>
              <StreamVideo client={client}>
                <StreamCall call={call}>
                  <StreamerViewComponent
                    call={call}
                    chatExpanded={chatExpanded}
                    setChatExpanded={setChatExpanded}
                    onStreamStop={async () => {
                      // Clear chat messages when stream stops
                      if (myChatRef.current) {
                        await myChatRef.current.clearChatMessages();
                      }
                      // Reset chat session id until the next stream starts
                      setChatSessionId(null);
                    }}
                    onStreamStart={(newChatSessionId) => {
                      setChatSessionId(newChatSessionId);
                    }}
                  />
                </StreamCall>
              </StreamVideo>
            </StreamTheme>
          </div>
          {chatExpanded && user?.id && userName && (
            <div className="col-span-1 h-full border-l border-muted bg-muted/30 overflow-hidden rounded-lg">
              <MyChat
                ref={myChatRef}
                userId={user.id}
                userName={userName}
                isStreamer={true}
                setChatExpanded={setChatExpanded}
                channelId={chatSessionId ?? `${userName.toLowerCase()}`}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full bg-background text-foreground col-span-full">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading stream...</p>
          </div>
        </div>
      )}
    </section>
  );
}

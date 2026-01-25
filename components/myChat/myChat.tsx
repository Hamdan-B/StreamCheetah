"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

import {
  useCallback,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Channel,
  Chat,
  MessageInput,
  MessageInputProps,
  MessageList,
  Window,
} from "stream-chat-react";
import CustomChannelHeader from "./customChannelHeader";

import { createTokenProvider } from "@/lib/streamClient";
import "stream-chat-react/dist/css/v2/index.css";
import "./myChat.css";
import CustomMessage from "./customMessage";

const StreamChatLib = require("stream-chat");

type StreamChannel = any;
type LocalMessage = { text?: string; user_id?: string };
type Message = Record<string, unknown>;
type SendMessageOptions = Record<string, unknown>;

export type MyChatRef = {
  clearChatMessages: () => Promise<void>;
};

const MyChat = forwardRef<
  MyChatRef,
  {
    userId: string;
    userName: string;
    isStreamer: boolean;
    setChatExpanded?: (expanded: boolean) => void;
    channelId?: string;
  }
>(function MyChat(
  { userId, userName, isStreamer, setChatExpanded, channelId },
  ref,
) {
  const [client, setClient] = useState<any>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [customColor, setCustomColor] = useState<string>();
  const [chatError, setChatError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Initialize Chat Client
  useEffect(() => {
    const initializeChatClient = async () => {
      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      if (!apiKey) {
        console.error("[MyChat] Stream API key is not set");
        setChatError("Chat service not configured");
        setIsLoading(false);
        return;
      }
      try {
        const newClient = new StreamChatLib.StreamChat(apiKey);
        await newClient.connectUser(
          {
            id: userId,
            name: userName,
          },
          createTokenProvider(userId),
        );
        setClient(newClient);
        setChatError(null);
      } catch (error) {
        console.error("[MyChat] Error initializing client:", error);
        setChatError("Failed to connect to chat");
        setIsLoading(false);
      }
    };

    if (!client) {
      initializeChatClient();
    }
  }, [userId, userName]); // Only depend on userId and userName to initialize once

  // Create Channel once client is ready with retry logic and channelId changes
  useEffect(() => {
    const createChannel = async () => {
      if (!client) {
        return;
      }
      try {
        setIsLoading(true);
        // Sanitize username to valid chat ID (letters, numbers, !-_)
        const baseId = userName.toLowerCase().replace(/[^a-z0-9!_-]/g, "-");
        const finalChannelId = (channelId || `${baseId}`)
          .toLowerCase()
          .replace(/[^a-z0-9!_-]/g, "-");
        const chatChannel = client.channel("livestream", finalChannelId);

        try {
          await chatChannel.create();
        } catch (createError: any) {
          // Channel might already exist, try to get it instead
          if (createError?.message?.includes("already exists")) {
            console.log(
              "[MyChat] Channel already exists, using existing channel",
            );
          } else {
            throw createError;
          }
        }

        try {
          await chatChannel.addMembers([userId], {
            text: `${userName} joined the stream.`,
            user_id: userId,
          });
        } catch (memberError: any) {
          // Member might already be added, continue anyway
          console.log(
            "[MyChat] Could not add member or already added:",
            memberError?.message,
          );
        }

        // Attempt to truncate existing messages (fallback to no-op on failure)
        try {
          await (chatChannel as any).truncate?.();
        } catch (clearError) {
          console.log("[MyChat] Truncate not permitted or failed:", clearError);
        }

        setCustomColor(createCustomColor());
        setChannel(chatChannel);
        setChatError(null);
        setIsLoading(false);
      } catch (error) {
        console.error("[MyChat] Error creating channel:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Retry logic for timeout errors
        if (errorMessage.includes("timeout") && retryCount < 3) {
          console.log(
            `[MyChat] Retrying channel creation... (attempt ${retryCount + 1}/3)`,
          );
          setRetryCount(retryCount + 1);
          // Retry after 2 seconds
          setTimeout(() => {
            createChannel();
          }, 2000);
        } else {
          setChatError(
            "Failed to connect to chat room. Please refresh the page.",
          );
          setIsLoading(false);
        }
      }
    };

    // Recreate channel whenever client ready and channelId changes
    if (client) {
      createChannel();
    }
  }, [client, userId, userName, retryCount, channelId]);

  const submitHandler: MessageInputProps["overrideSubmitHandler"] = useCallback(
    async (params: {
      cid: string;
      localMessage: LocalMessage;
      message: Message;
      sendOptions: SendMessageOptions;
    }) => {
      // custom logic goes here
      await channel?.sendMessage(
        {
          text: params.localMessage.text,
          user_id: params.localMessage.user_id,
          color: customColor,
          isStreamer: isStreamer,
        },
        params.sendOptions,
      );
    },
    [channel, customColor, isStreamer],
  );

  // Expose a method to clear chat messages when stream stops
  const clearChatMessages = useCallback(async () => {
    if (!channel) return;
    try {
      console.log("[MyChat] Clearing chat messages...");
      const messages = await channel.query({ limit: 100 });
      if (messages.messages && messages.messages.length > 0) {
        for (const message of messages.messages) {
          try {
            await channel.deleteMessage(message.id);
          } catch (deleteError) {
            console.log("[MyChat] Could not delete message:", deleteError);
          }
        }
      }
      console.log("[MyChat] Chat messages cleared successfully");
    } catch (error) {
      console.error("[MyChat] Error clearing chat messages:", error);
    }
  }, [channel]);

  // Expose the clearChatMessages function to parent components via ref
  useImperativeHandle(
    ref,
    () => ({
      clearChatMessages,
    }),
    [clearChatMessages],
  );

  if (chatError) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-muted p-4">
        <div className="w-12 h-12 bg-error/20 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-foreground font-semibold text-center mb-4">
          {chatError}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (isLoading || !client || !channel) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-muted">
        <div className="w-8 h-8 border-4 border-muted-foreground border-t-primary rounded-full animate-spin mb-3"></div>
        <p className="text-muted-foreground text-sm">Connecting to chat...</p>
      </div>
    );
  }

  return (
    <Chat client={client}>
      <Channel channel={channel} Message={CustomMessage}>
        <Window>
          <CustomChannelHeader setChatExpanded={setChatExpanded} />
          <MessageList />
          <MessageInput overrideSubmitHandler={submitHandler} />
        </Window>
      </Channel>
    </Chat>
  );
});

function createCustomColor(): string {
  const colors = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "pink",
    "brown",
    "gray",
    "black",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default MyChat;

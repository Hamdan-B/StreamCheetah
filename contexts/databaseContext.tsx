import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useState } from "react";
import type { Tables } from "../database/database.types";

type DatabaseContextType = {
  supabase: SupabaseClient | null;
  error: string | null;
  setSupabaseClient: (accessToken: string) => void;
  getUserData: (
    userId: string,
    field?: string,
  ) => Promise<Tables<"users"> | null>;
  setUserData: (
    userName: string,
    imageUrl: string,
    mail: string,
    dateOfBirth: string,
    userId: string,
  ) => Promise<Tables<"users"> | null>;
  setUserInterests: (
    interests: string[],
    userId: string,
  ) => Promise<Tables<"users"> | null>;
  getLivestreams: () => Promise<Tables<"livestreams">[]>;
  createLivestream: (
    name: string,
    categories: string[],
    userName: string,
    profileImageUrl: string,
  ) => Promise<Tables<"livestreams"> | null>;
  deleteLivestream: (userName: string) => Promise<boolean>;
  setLiveStatus: (userName: string, isLive: boolean) => Promise<boolean>;
  followUser: (
    currentUserId: string,
    userToFollowId: string,
  ) => Promise<boolean>;
};

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const setSupabaseClient = useCallback(
    async (token: string): Promise<void> => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables");
      }
      setAccessToken(token);
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
        },
      });

      // Set the session with the token using the correct API
      await supabaseClient.auth.setSession({
        access_token: token,
        refresh_token: "",
      });

      setSupabase(supabaseClient);
    },
    [],
  );

  const getUserData = useCallback(
    async (
      userId: string,
      field: string = "user_id",
    ): Promise<Tables<"users"> | null> => {
      if (!supabase) {
        return null;
      }
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq(field, userId)
          .maybeSingle();

        if (error) {
          console.error("[getUserData] Error fetching user", error);
          setError(`Error getting user data: ${error.message}`);
          return null;
        }
        return data;
      } catch (error) {
        console.error("[getUserData] Unexpected error", error);
        return null;
      }
    },
    [supabase],
  );

  const setUserData = useCallback(
    async (
      userName: string,
      imageUrl: string,
      mail: string,
      dateOfBirth: string,
      userId: string,
    ): Promise<Tables<"users"> | null> => {
      if (!supabase) {
        return null;
      }
      const { data, error } = await supabase
        .from("users")
        .upsert(
          {
            user_name: userName,
            image_url: imageUrl,
            mail: mail,
            date_of_birth: dateOfBirth,
            user_id: userId,
            following: [],
            followers: [],
            interests: [],
          },
          { onConflict: "user_id" },
        )
        .select()
        .single();

      if (error) {
        console.error("Error setting user data", error);
        setError(`Error setting user data: ${error.message}`);
        return null;
      }
      return data as Tables<"users">;
    },
    [supabase],
  );

  const setUserInterests = useCallback(
    async (
      interests: string[],
      userId: string,
    ): Promise<Tables<"users"> | null> => {
      if (!supabase) {
        return null;
      }
      const { data, error } = await supabase
        .from("users")
        .update({ interests: interests })
        .eq("user_id", userId)
        .select()
        .single();
      if (error) {
        console.error("Error setting user interests", error);
        setError(`Error setting user interests: ${error.message}`);
        return null;
      }
      return data as Tables<"users">;
    },
    [supabase],
  );

  const getLivestreams = useCallback(async (): Promise<
    Tables<"livestreams">[]
  > => {
    if (!supabase) {
      return [];
    }
    const { data, error } = await supabase.from("livestreams").select("*");
    if (error) {
      console.log("Error getting livestreams", error);
      return [];
    }
    return data as Tables<"livestreams">[];
  }, [supabase]);

  const createLivestream = useCallback(
    async (
      name: string,
      categories: string[],
      userName: string,
      profileImageUrl: string,
    ): Promise<Tables<"livestreams"> | null> => {
      if (!supabase) {
        console.error("[createLivestream]Supabase not initialized");
        return null;
      }
      const chatSessionId = `${userName.toLowerCase()}-${Date.now()}`;
      // Use upsert to handle existing records
      const { data, error } = await supabase
        .from("livestreams")
        .upsert(
          {
            name: name,
            categories: categories,
            user_name: userName,
            profile_image_url: profileImageUrl,
            is_live: true,
            chat_session_id: chatSessionId,
          },
          { onConflict: "user_name" },
        )
        .select()
        .single();
      if (error) {
        console.log("Error creating livestream", error);
        setError(error.message);
        return null;
      }
      return data as Tables<"livestreams">;
    },
    [supabase],
  );

  const deleteLivestream = useCallback(
    async (userName: string): Promise<boolean> => {
      if (!supabase) {
        console.error("[deleteLivestream] Supabase not initialized");
        return false;
      }
      const { error } = await supabase
        .from("livestreams")
        .delete()
        .eq("user_name", userName);
      if (error) {
        console.log("Error deleting livestream", error);
        setError(error.message);
        return false;
      }
      return true;
    },
    [supabase],
  );

  const setLiveStatus = useCallback(
    async (userName: string, isLive: boolean): Promise<boolean> => {
      if (!supabase) {
        console.error("[setLiveStatus] Supabase not initialized");
        return false;
      }
      try {
        const { error } = await supabase
          .from("livestreams")
          .update({ is_live: isLive })
          .eq("user_name", userName);
        if (error) {
          console.error("[setLiveStatus] Error updating live status", error);
          setError(`Error updating live status: ${error.message}`);
          return false;
        }
        console.log(`[setLiveStatus] Updated ${userName} to is_live=${isLive}`);
        return true;
      } catch (error) {
        console.error("[setLiveStatus] Error:", error);
        return false;
      }
    },
    [supabase],
  );

  const followUser = useCallback(
    async (currentUserId: string, userToFollowId: string): Promise<boolean> => {
      if (!supabase) {
        console.error("[followUser] Supabase not initialized");
        return false;
      }

      try {
        const currentUser = await getUserData(currentUserId, "user_id");
        if (!currentUser) {
          console.error("[followUser] Current user not found");
          return false;
        }

        const userToFollow = await getUserData(userToFollowId, "user_id");
        if (!userToFollow) {
          console.error("[followUser] User to follow not found");
          return false;
        }

        // Update following lists
        let updatedCurrentUserFollowing: string[] = [];
        let updatedUserToFollowFollowers: string[] = [];
        if (currentUser.following.includes(userToFollowId)) {
          // Remove from the lists if already following
          updatedCurrentUserFollowing = currentUser.following.filter(
            (id) => id !== userToFollow.user_id,
          );
          updatedUserToFollowFollowers = userToFollow.followers.filter(
            (id) => id !== currentUserId,
          );
        } else {
          // If not following, add to following list
          updatedCurrentUserFollowing = [
            ...currentUser.following,
            userToFollowId,
          ];
          updatedUserToFollowFollowers = [
            ...userToFollow.followers,
            currentUserId,
          ];
        }

        const { error: currentUserError } = await supabase
          .from("users")
          .update({ following: updatedCurrentUserFollowing })
          .eq("user_id", currentUserId);

        if (currentUserError) {
          console.error(
            "[followUser] Error updating current user following",
            currentUserError,
          );
          return false;
        }

        const { error: userToFollowError } = await supabase
          .from("users")
          .update({ followers: updatedUserToFollowFollowers })
          .eq("user_id", userToFollow.user_id);

        if (userToFollowError) {
          console.error(
            "[followUser] Error updating user to follow followers",
            userToFollowError,
          );
          return false;
        }

        console.log("[followUser] Successfully followed user");
        return true;
      } catch (error) {
        console.error("[followUser] Error following user", error);
        return false;
      }
    },
    [supabase, getUserData],
  );

  return (
    <DatabaseContext.Provider
      value={{
        supabase,
        error,
        setSupabaseClient,
        getUserData,
        setUserData,
        setUserInterests,
        getLivestreams,
        createLivestream,
        deleteLivestream,
        setLiveStatus,
        followUser,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

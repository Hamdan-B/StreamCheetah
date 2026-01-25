"use client";

import { useSearchParams } from "next/navigation";
import { useDatabase } from "@/contexts/databaseContext";
import { useSupabaseAuth } from "@/lib/supabaseAuth";
import { useEffect, useState } from "react";
import { Tables } from "@/database/database.types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/loading";
import Badge from "@/components/homeFeed/badge";
import { slugify } from "@/lib/utils";
import type { MouseEvent } from "react";
import { categories } from "@/lib/types/category";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { user, supabaseClient } = useSupabaseAuth();
  const { supabase, setSupabaseClient, getLivestreams } = useDatabase();

  const [livestreams, setLivestreams] = useState<Tables<"livestreams">[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSupabase = async () => {
      if (supabaseClient && !supabase) {
        const session = await supabaseClient.auth.getSession();
        const token = session?.data.session?.access_token;
        if (token) {
          await setSupabaseClient(token);
        }
      }
    };

    if (user && supabaseClient && !supabase) {
      initializeSupabase();
    }
  }, [user, supabaseClient, supabase, setSupabaseClient]);

  useEffect(() => {
    const loadLivestreams = async () => {
      if (!supabase) return;
      setIsLoading(true);
      const streams = await getLivestreams();
      setLivestreams(streams);
      setIsLoading(false);
    };

    loadLivestreams();
  }, [supabase, getLivestreams]);

  // Filter results based on search query
  const searchLower = query.toLowerCase();

  // Search streamers/livestreams
  const matchingStreams = livestreams.filter(
    (stream) =>
      stream.name.toLowerCase().includes(searchLower) ||
      stream.user_name.toLowerCase().includes(searchLower) ||
      stream.categories.some((cat) => cat.toLowerCase().includes(searchLower)),
  );

  // Search categories
  const matchingCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchLower),
  );

  // Separate live and offline streamers
  const liveStreamers = matchingStreams.filter((s) => s.is_live);
  const offlineStreamers = matchingStreams.filter((s) => !s.is_live);

  return (
    <div className="w-full h-full bg-background text-foreground overflow-y-auto scrollbar-hide">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Search Results</h1>
          <p className="text-muted-foreground">
            Results for "
            <span className="text-foreground font-semibold">{query}</span>"
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Searching...</p>
          </div>
        ) : matchingStreams.length === 0 && matchingCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted rounded-2xl">
            <div className="w-20 h-20 bg-muted-foreground/10 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              No results found
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              Try searching for different keywords, streamer names, or
              categories
            </p>
          </div>
        ) : (
          <>
            {/* Live Streamers */}
            {liveStreamers.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 bg-error rounded-full animate-pulse" />
                  Live Streamers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {liveStreamers.map((livestream) => (
                    <button
                      onClick={() =>
                        router.push(`/app/${livestream.user_name}`)
                      }
                      key={livestream.id}
                      className="group cursor-pointer text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="relative bg-muted aspect-video rounded-xl overflow-hidden mb-3">
                        <Image
                          src={livestream.profile_image_url}
                          alt={livestream.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 bg-error text-white uppercase text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                          Live
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <Image
                            src={livestream.profile_image_url}
                            alt={livestream.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {livestream.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {livestream.user_name}
                          </p>
                          <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                            {livestream.categories.map((category, index) => (
                              <Badge
                                text={category}
                                key={index}
                                onClick={(e: MouseEvent<HTMLSpanElement>) => {
                                  e.stopPropagation();
                                  router.push(`/browse/${slugify(category)}`);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Offline Streamers */}
            {offlineStreamers.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Streamers
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {offlineStreamers.map((livestream) => (
                    <button
                      onClick={() =>
                        router.push(`/app/${livestream.user_name}`)
                      }
                      key={livestream.id}
                      className="group cursor-pointer text-left"
                    >
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3">
                        <Image
                          src={livestream.profile_image_url}
                          alt={livestream.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {livestream.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        @{livestream.user_name}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Categories */}
            {matchingCategories.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Categories
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {matchingCategories.map((category) => (
                    <button
                      key={category.id}
                      className="group text-left"
                      onClick={() =>
                        router.push(`/browse/${slugify(category.name)}`)
                      }
                    >
                      <div className="relative bg-muted aspect-[3/4] rounded-xl overflow-hidden mb-3">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <p className="absolute bottom-3 left-3 text-white font-bold text-sm">
                          {category.name}
                        </p>
                      </div>
                      {category.tags && (
                        <div className="flex items-center flex-wrap gap-1.5">
                          {category.tags.map((tag) => (
                            <Badge
                              text={tag}
                              key={tag}
                              onClick={(e: MouseEvent<HTMLSpanElement>) => {
                                e.stopPropagation();
                                router.push(`/browse/${slugify(tag)}`);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

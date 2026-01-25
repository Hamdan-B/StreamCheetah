"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSupabaseAuth } from "@/lib/supabaseAuth";
import { useDatabase } from "@/contexts/databaseContext";
import { Tables } from "@/database/database.types";
import { useRouter } from "next/navigation";
import Badge from "@/components/homeFeed/badge";
import { slugify } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading";
import type { MouseEvent } from "react";

export default function BrowseByCategory({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, supabaseClient } = useSupabaseAuth();
  const { supabase, setSupabaseClient, getLivestreams } = useDatabase();
  const [livestreams, setLivestreams] = useState<Tables<"livestreams">[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const slugToText = (slug: string) =>
    slug.replace(/-/g, " ").replace(/\s+/g, " ").trim();

  const categorySlug = decodeURIComponent(resolvedParams.category);
  const categoryLabel = useMemo(
    () =>
      slugToText(categorySlug)
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    [categorySlug],
  );

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

  const filteredStreams = useMemo(
    () =>
      livestreams.filter((stream) =>
        stream.categories.some((cat) => slugify(cat) === categorySlug),
      ),
    [livestreams, categorySlug],
  );

  const liveFiltered = filteredStreams.filter((s) => s.is_live);
  const offlineFiltered = filteredStreams.filter((s) => !s.is_live);

  return (
    <div className="w-full h-full bg-background text-foreground overflow-y-auto scrollbar-hide">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-muted">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Category</p>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {categoryLabel || categorySlug}
            </h1>
          </div>
          <button
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
            onClick={() => router.push("/browse")}
          >
            ← Back to Browse
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Loading streams...</p>
          </div>
        ) : filteredStreams.length === 0 ? (
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              No streams yet
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              There are currently no streams or streamers in this category.
              Check back later!
            </p>
          </div>
        ) : (
          <>
            {/* Live Streamers */}
            {liveFiltered.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 bg-error rounded-full animate-pulse" />
                  Live Now
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {liveFiltered.map((livestream) => (
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
            {offlineFiltered.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  All Streamers
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {offlineFiltered.map((livestream) => (
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
          </>
        )}
      </div>
    </div>
  );
}

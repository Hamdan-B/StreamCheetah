"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import { Tables } from "@/database/database.types";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/types/category";
import { slugify } from "@/lib/utils";
import Badge from "./badge";

export default function HomeFeed({
  livestreams,
}: {
  livestreams: Tables<"livestreams">[];
}) {
  const router = useRouter();
  const liveStreams = livestreams.filter((stream) => stream.is_live);
  const allStreamers = livestreams;
  const featuredStream = liveStreams[0];

  return (
    <div className="bg-background w-full h-full text-foreground overflow-y-scroll scrollbar-hide">
      {/* Featured Stream Banner */}
      {featuredStream && (
        <section className="relative h-96 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={featuredStream.profile_image_url}
              alt={featuredStream.name}
              fill
              className="object-cover"
              priority
            />
            {/* Fix: Changed from-black to from-background to match the theme */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
          </div>
          <button
            onClick={() => router.push(`/app/${featuredStream.user_name}`)}
            /* Fix: Changed text-white to text-foreground */
            className="relative h-full w-full flex flex-col justify-between p-8 text-foreground hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-error rounded-full text-xs font-bold uppercase flex items-center gap-1 text-white">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Live Now
              </span>
            </div>
            <div className="max-w-2xl text-left">
              <h2 className="text-5xl font-bold mb-3">{featuredStream.name}</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={featuredStream.profile_image_url}
                    alt={featuredStream.name}
                    fill
                    className="rounded-full object-cover ring-2 ring-border"
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    @{featuredStream.user_name}
                  </p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {featuredStream.categories.slice(0, 2).map((cat, idx) => (
                      <Badge text={cat} key={idx} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm opacity-90">Click to watch the stream</p>
            </div>
          </button>
        </section>
      )}

      {/* Live Streams Section (excluding featured) */}
      <section className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Other Live Streams
        </h2>
        {liveStreams.length > 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveStreams.slice(1).map((livestream) => (
              <button
                onClick={() => {
                  router.push(`/app/${livestream.user_name}`);
                }}
                key={livestream.id}
                className="group cursor-pointer text-left"
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
                      className="rounded-full object-cover ring-1 ring-border"
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
        ) : liveStreams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted rounded-xl">
            <div className="w-16 h-16 bg-muted-foreground/10 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
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
            <p className="text-muted-foreground text-center text-lg">
              No live streams right now
            </p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Check back later!
            </p>
          </div>
        ) : null}
      </section>

      {/* All Streamers Section */}
      <section className="p-6 border-b border-border bg-muted/30">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Recommended Streamers
        </h2>
        <p className="text-muted-foreground mb-6">
          Check out who&apos;s streaming and offline
        </p>
        {allStreamers.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {allStreamers.map((livestream) => (
              <button
                onClick={() => {
                  router.push(`/app/${livestream.user_name}`);
                }}
                key={livestream.id}
                className="group cursor-pointer"
              >
                <div className="relative mb-3 rounded-full overflow-hidden ring-2 ring-border">
                  <div className="relative w-full aspect-square">
                    <Image
                      src={livestream.profile_image_url}
                      alt={livestream.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Fix: Changed overlay to be less harsh in light mode */}
                    <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/20 transition-colors" />
                  </div>
                  {livestream.is_live && (
                    /* Fix: Changed ring-white to ring-background */
                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-error rounded-full ring-2 ring-background animate-pulse" />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-xs font-semibold text-foreground truncate">
                    {livestream.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground truncate">
                    @{livestream.user_name}
                  </p>
                  {livestream.is_live && (
                    <p className="text-[10px] text-error font-semibold mt-0.5">
                      ● LIVE
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-background rounded-xl border border-border">
            <div className="w-16 h-16 bg-muted-foreground/10 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-muted-foreground text-center text-lg">
              No streamers yet
            </p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Be the first to go live!
            </p>
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Browse Categories
        </h2>
        <p className="text-muted-foreground mb-6">
          Explore streams by category
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              className="group text-left"
              onClick={() => router.push(`/browse/${slugify(category.name)}`)}
            >
              <div className="relative bg-muted aspect-[3/4] rounded-xl overflow-hidden mb-3 ring-1 ring-border">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Fix: Changed from-black to from-foreground/80 for the text shadow */}
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
    </div>
  );
}

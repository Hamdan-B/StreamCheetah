"use client";

import { useState } from "react";
import Image from "next/image";
import { Tables } from "@/database/database.types";
import { ArrowRight } from "@/components/icons";
import { useRouter } from "next/navigation";

export default function LiveChannels({
  livestreams,
}: {
  livestreams: Tables<"livestreams">[];
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  // Only show streams that are currently live
  const liveStreams = livestreams.filter((stream) => stream.is_live);

  return (
    <div
      className={`bg-card border-r border-border text-foreground p-4 flex flex-col gap-2 overflow-y-scroll scrollbar-hide transition-all duration-300 ${
        expanded ? "w-64" : "w-16"
      }`}
    >
      <div
        className={`flex items-center pb-3 ${
          expanded ? "justify-between" : "justify-center"
        }`}
      >
        {expanded && (
          <h2 className="text-sm uppercase font-bold text-foreground tracking-wide">
            Live Channels
          </h2>
        )}
        <button
          className={`text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-muted p-2 ${
            expanded ? "" : "rotate-180"
          } transition-all duration-200`}
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ArrowRight />
        </button>
      </div>

      {liveStreams.length > 0 ? (
        <div className="flex flex-col gap-2">
          {liveStreams.map((livestream) => (
            <button
              key={livestream.id}
              className="flex items-center gap-3 hover:bg-muted p-2 rounded-lg transition-colors group"
              onClick={() => router.push(`/app/${livestream.user_name}`)}
            >
              <div className="relative flex-shrink-0">
                <Image
                  src={livestream.profile_image_url}
                  alt={livestream.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-error rounded-full border-2 border-card" />
              </div>
              {expanded && (
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {livestream.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {livestream.categories[0] || "Streaming"}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center py-12 ${expanded ? "" : "hidden"}`}
        >
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-muted-foreground"
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
          <p className="text-xs text-muted-foreground text-center px-2">
            No live streams yet
          </p>
        </div>
      )}
    </div>
  );
}

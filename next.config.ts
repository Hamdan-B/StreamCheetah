import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "thispersondoesnotexist.com",
      },
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  // Point to full ESM build of stream-chat that includes attachment helpers used by stream-chat-react
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "stream-chat": "stream-chat/dist/index.es.js",
    };
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        "stream-chat": "stream-chat/dist/index.es.js",
      },
    },
  },
};

export default nextConfig;

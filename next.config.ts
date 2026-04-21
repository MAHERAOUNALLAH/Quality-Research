import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from the local /uploads/ path (served from /public)
  // and from common remote sources.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Ensure server-only Node.js modules like `fs` and `path` are not
  // bundled into the Edge runtime.  The upload route uses the Node runtime.
  experimental: {
    serverComponentsHmrCache: false,
  },
};

export default nextConfig;

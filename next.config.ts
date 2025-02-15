import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: "standalone",

  // Configure headers for downloads directory
  async headers() {
    return [
      {
        source: "/downloads/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Disable Next.js image optimization if not needed
  images: {
    unoptimized: true,
  },

  // Enable server source maps in development
  productionBrowserSourceMaps: process.env.NODE_ENV === "development",

  // Configure build output for Docker
  outputFileTracingRoot: path.join(__dirname, "../../"),
  experimental: {},
};

import path from "path";
export default nextConfig;

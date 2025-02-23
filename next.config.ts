import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["yt-dlp"], // Moved from experimental
  async headers() {
    return [
      {
        source: "/downloads/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,HEAD,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type,Range" },
          { key: "Accept-Ranges", value: "bytes" },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    "/api/generate-clip": [
      "./public/cookies/cookies.txt",
      "./public/bin/yt-dlp",
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /cookies\.txt$/,
      type: "asset/resource",
      generator: {
        filename: "static/cookies/[name][ext]",
      },
    });
    return config;
  },
};

export default nextConfig;

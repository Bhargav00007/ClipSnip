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
  experimental: {
    // Only valid experimental flags
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      ],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Asset handling for binaries and cookies
    config.module.rules.push(
      {
        test: /yt-dlp$/,
        type: "asset/resource",
        generator: {
          filename: "static/bin/[name][ext]",
        },
      },
      {
        test: /cookies\.txt$/,
        type: "asset/resource",
        generator: {
          filename: "static/cookies/[name][ext]",
        },
      }
    );

    return config;
  },
};

export default nextConfig;

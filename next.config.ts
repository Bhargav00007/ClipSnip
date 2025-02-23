import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
    // Use the correct typing for file tracing
    serverComponentsExternalPackages: ["yt-dlp"],
    serverActions: {
      bodySizeLimit: "1mb",
      allowedOrigins: ["*"],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Add binary files to build output
    config.module.rules.push({
      test: /yt-dlp$/,
      type: "asset/resource",
      generator: {
        filename: "static/bin/[name][ext]",
      },
    });

    return config;
  },
};

export default nextConfig;

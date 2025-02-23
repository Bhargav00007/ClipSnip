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
          { key: "Access-Control-Allow-Origin", value: "" },
          { key: "Access-Control-Allow-Methods", value: "GET,HEAD,OPTIONS" },
<<<<<<< HEAD
          { key: "Access-Control-Allow-Headers", value: "Content-Type,Range" },
=======
          { key: "Access-Control-Allow-Headers", value: "Range" },
          { key: "Accept-Ranges", value: "bytes" },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/test/:path",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "" },
          { key: "Access-Control-Allow-Methods", value: "GET,HEAD,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Range" },
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
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
<<<<<<< HEAD
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
=======
  productionBrowserSourceMaps: process.env.NODE_ENV === "development",
  outputFileTracingRoot: path.join(__dirname),
  experimental: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Added to skip ESLint errors
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
  },
};

export default nextConfig;

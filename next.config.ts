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
  images: { unoptimized: true },
  experimental: {},
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;

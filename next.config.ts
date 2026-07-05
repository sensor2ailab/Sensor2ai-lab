import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Keep native/server-only backend packages out of the bundler so they load at
  // runtime on the Node server (route handlers run with the nodejs runtime).
  serverExternalPackages: ["@prisma/client", "prisma", "@node-rs/argon2"],
  images: {
    // Modern formats first for smaller payloads.
    formats: ["image/avif", "image/webp"],
    // Placeholder photos are pulled from Unsplash for now.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async headers() {
    return [
      {
        // Immutable caching for hashed static assets behind a CDN.
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

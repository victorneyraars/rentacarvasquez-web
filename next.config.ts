import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api-dev.baqueanonatales.com" },
      { protocol: "https", hostname: "api.baqueanonatales.com" },
      { protocol: "https", hostname: "pub-26428d066b4c4eeab91fc8fedf8c036c.r2.dev" },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;

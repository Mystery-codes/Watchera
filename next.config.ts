import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Load remote posters directly in the browser instead of proxying through
    // the Next.js optimizer, which times out on slow upstream hosts.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "pbcdnw.aoneroom.com" },
    ],
  },
};

export default nextConfig;

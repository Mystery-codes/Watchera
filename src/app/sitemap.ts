import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/popular-series`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/animation`, changeFrequency: "weekly", priority: 0.8 },
  ];
}

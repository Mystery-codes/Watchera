import type { MetadataRoute } from "next";

import { fetchRanking, RANKING_IDS } from "@/lib/plexhd";
import { createItemRoute } from "@/lib/seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [popularMovies, trendingMovies, popularSeries] = await Promise.all([
    fetchRanking(RANKING_IDS.popularMovies, 12),
    fetchRanking(RANKING_IDS.trending, 12),
    fetchRanking(RANKING_IDS.popularSeries, 12),
  ]);

  const items = [...popularMovies, ...trendingMovies, ...popularSeries];
  const unique = new Map<string, typeof items[number]>();

  for (const item of items) {
    const key = item.subjectId ?? String(item.id);
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  }

  const contentPages = [...unique.values()].map((item) => ({
    url: `${siteUrl}${createItemRoute(item)}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/popular-series`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/animation`, changeFrequency: "weekly", priority: 0.8 },
    ...contentPages,
  ];
}

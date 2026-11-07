import type { MetadataRoute } from "next";
import { fetchRanking, RANKING_IDS } from "@/lib/plexhd";
import { getTitlePath } from "@/lib/seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const titleGroups = await Promise.all([
    fetchRanking(RANKING_IDS.popularMovies, 60),
    fetchRanking(RANKING_IDS.popularSeries, 60),
    fetchRanking(RANKING_IDS.animation, 60),
  ]);
  const titles = new Map(titleGroups.flat().map((movie) => [getTitlePath(movie), movie]));

  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/popular-series`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/animation`, changeFrequency: "weekly", priority: 0.8 },
    ...Array.from(titles.keys(), (path) => ({
      url: new URL(path, siteUrl).toString(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}

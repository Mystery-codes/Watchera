import type { MetadataRoute } from "next";
import { fetchRanking, RANKING_IDS } from "@/lib/plexhd";
import { getTitlePath, siteUrl } from "@/lib/seo";

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
    { url: `${siteUrl}/movies`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/popular-series`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/animation`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/new-releases`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/founder/divine-ifediorah`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/help-center`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/ways-to-watch`, changeFrequency: "monthly", priority: 0.4 },
    ...Array.from(titles.keys(), (path) => ({
      url: new URL(path, siteUrl).toString(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}

import { NextResponse } from "next/server";
import { fetchRanking, RANKING_IDS } from "@/lib/plexhd";

const sections = [
  { title: "Trending Now", id: RANKING_IDS.trending },
  { title: "Popular Movies", id: RANKING_IDS.popularMovies },
  { title: "Nollywood", id: RANKING_IDS.nollywood },
  { title: "K-Drama", id: RANKING_IDS.kDrama },
  { title: "Anime", id: RANKING_IDS.anime },
  { title: "Animation", id: RANKING_IDS.animation },
  { title: "Popular Series", id: RANKING_IDS.popularSeries },
] as const;

export async function GET() {
  const results = await Promise.all(
    sections.map(async ({ title, id }) => ({
      title,
      movies: await fetchRanking(id, 12),
    }))
  );
  const rows = results.filter((row) => row.movies.length > 0);
  const featured =
    rows.find((row) => row.title === "Popular Movies")?.movies[0] ??
    rows[0]?.movies[0] ??
    null;

  return NextResponse.json(
    { featured, rows },
    { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } }
  );
}
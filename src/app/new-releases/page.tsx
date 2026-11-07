import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { fetchRanking, RANKING_IDS } from "@/lib/plexhd";

export const metadata: Metadata = {
  title: "New Releases",
  description: "Browse recently released movies and series on Watchera.",
  alternates: { canonical: "/new-releases" },
};

export default async function NewReleasesPage() {
  const groups = await Promise.all([
    fetchRanking(RANKING_IDS.popularMovies, 60),
    fetchRanking(RANKING_IDS.popularSeries, 60),
    fetchRanking(RANKING_IDS.animation, 60),
  ]);
  const titles = new Map(groups.flat().map((movie) => [movie.subjectId ?? movie.detailPath ?? String(movie.id), movie]));
  const movies = Array.from(titles.values())
    .sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""))
    .slice(0, 60);

  return <><Navbar /><CatalogPage title="New Releases" movies={movies} /><Footer /></>;
}
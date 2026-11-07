import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { fetchRanking, RANKING_IDS } from "@/lib/plexhd";

export const metadata: Metadata = {
  title: "Movies",
  description: "Browse popular movies on Watchera.",
  alternates: { canonical: "/movies" },
};

export default async function MoviesPage() {
  const movies = await fetchRanking(RANKING_IDS.popularMovies, 60);
  return <><Navbar /><CatalogPage title="Movies" movies={movies} /><Footer /></>;
}
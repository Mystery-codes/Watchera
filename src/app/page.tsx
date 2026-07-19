import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { MovieBrowser } from "@/components/movie-browser";
import { Footer } from "@/components/footer";
import { movies as mockMovies, rows as mockRows } from "@/lib/movies";
import { fetchRanking, RANKING_IDS } from "@/lib/plexhd";

export default async function Home() {
  const heroMovie = mockMovies[0];

  const sections = [
    { title: "Trending Now", id: RANKING_IDS.trending },
    { title: "Popular Movies", id: RANKING_IDS.popularMovies },
    { title: "Action Movies", id: RANKING_IDS.actionMovies },
    { title: "Anime", id: RANKING_IDS.anime },
    { title: "K-Drama", id: RANKING_IDS.kDrama },
  ];

  const fetched = await Promise.all(
    sections.map(async (s) => ({
      title: s.title,
      movies: await fetchRanking(s.id, 12),
    }))
  );

  const rows = fetched.map((r) => ({
    title: r.title,
    movies:
      r.movies.length > 0
        ? r.movies
        : (mockRows.find((m) => m.title === r.title)?.movies ?? mockMovies),
  }));

  return (
    <main className="min-h-full bg-background">
      <Navbar />
      <MovieBrowser rows={rows} heroMovie={heroMovie} />
      <Footer />
    </main>
  );
}

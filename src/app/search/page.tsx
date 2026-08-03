import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SearchContent } from "@/components/search-content";
import type { Movie } from "@/lib/movies";
import { fetchRanking, RANKING_IDS } from "@/lib/plexhd";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  let movies: Movie[] = [];
  if (query) {
    const ids = [
      RANKING_IDS.trending,
      RANKING_IDS.popularMovies,
      RANKING_IDS.popularSeries,
      RANKING_IDS.actionMovies,
      RANKING_IDS.anime,
      RANKING_IDS.animation,
      RANKING_IDS.horrorMovies,
      RANKING_IDS.fantasy,
      RANKING_IDS.marvel,
      RANKING_IDS.dc,
      RANKING_IDS.kDrama,
      RANKING_IDS.adventure,
      RANKING_IDS.topBox,
      RANKING_IDS.disney,
      RANKING_IDS.tmdbTop250,
      RANKING_IDS.dreamworks,
      RANKING_IDS.pixar,
      RANKING_IDS.shortTv,
      RANKING_IDS.saDrama,
      RANKING_IDS.thaiSeries,
      RANKING_IDS.cDrama,
      RANKING_IDS.turkishDrama,
      RANKING_IDS.yorubaMovies,
      RANKING_IDS.nollywood,
      RANKING_IDS.teenRomance,
      RANKING_IDS.blackExcellence,
    ];
    const pools = await Promise.all(ids.map((id) => fetchRanking(id, 20)));
    const combined = pools.flat();
    const seen = new Set<number>();
    const unique = combined.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
    const normalized = query.toLowerCase();
    movies = unique.filter((m) => {
      const haystack = `${m.title} ${m.genres.join(" ")}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }

  return (
    <main className="min-h-full bg-background">
      <Navbar />
      <SearchContent query={query} movies={movies} />
      <Footer />
    </main>
  );
}

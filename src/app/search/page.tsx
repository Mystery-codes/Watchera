import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MovieCard } from "@/components/movie-card";
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
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-8">
        <h1 className="mb-6 text-2xl font-bold text-white">
          {query ? (
            <>
              Results for <span className="text-primary">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            "Search"
          )}
        </h1>

        {!query ? (
          <p className="text-zinc-400">Type something in the search bar to find movies.</p>
        ) : movies.length === 0 ? (
          <p className="text-zinc-400">
            No results found for &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

import { Navbar } from "@/components/navbar";
import { MovieBrowser } from "@/components/movie-browser";
import { Footer } from "@/components/footer";
import type { Movie } from "@/lib/movies";
import { fetchRanking, RANKING_IDS } from "@/lib/plexhd";

export default async function Home() {
  const popular = await fetchRanking(RANKING_IDS.popularMovies, 24);
  const generalPool = popular.length > 0 ? popular : await fetchRanking(RANKING_IDS.trending, 24);
  const heroMovie =
    generalPool.find((m) => m.detailPath) ??
    generalPool[0] ?? {
      id: 1,
      title: "Now Loading",
      year: 0,
      rating: "—",
      duration: "—",
      genres: ["Drama"],
      description: "",
      poster: "",
      banner: "",
    };

  const sections = [
    { title: "Trending Now", id: RANKING_IDS.trending },
    { title: "Popular Movies", id: RANKING_IDS.popularMovies },
    { title: "Action Movies", id: RANKING_IDS.actionMovies },
    { title: "Anime", id: RANKING_IDS.anime },
    { title: "K-Drama", id: RANKING_IDS.kDrama },
    { title: "Animation", id: RANKING_IDS.animation },
    { title: "Gangstar", id: RANKING_IDS.gangstar },
    { title: "Black Excellence", id: RANKING_IDS.blackExcellence },
    { title: "Horror Movies", id: RANKING_IDS.horrorMovies },
    { title: "C-Drama", id: RANKING_IDS.cDrama },
    { title: "Teen & Romance", id: RANKING_IDS.teenRomance },
    { title: "Fantasy", id: RANKING_IDS.fantasy },
    { title: "Top Box", id: RANKING_IDS.topBox },
    { title: "Disney+", id: RANKING_IDS.disney },
    { title: "TMBD Top 250", id: RANKING_IDS.tmdbTop250 },
    { title: "Marvel", id: RANKING_IDS.marvel },
    { title: "DC", id: RANKING_IDS.dc },
    { title: "Dreamworks", id: RANKING_IDS.dreamworks },
    { title: "Pixar", id: RANKING_IDS.pixar },
    { title: "Short TV", id: RANKING_IDS.shortTv },
    { title: "SA Drama", id: RANKING_IDS.saDrama },
    { title: "Thai Series", id: RANKING_IDS.thaiSeries },
    { title: "Adventures", id: RANKING_IDS.adventure },
    { title: "Turkish Drama", id: RANKING_IDS.turkishDrama },
    { title: "Yoruba Movies", id: RANKING_IDS.yorubaMovies },
    { title: "Nollywood", id: RANKING_IDS.nollywood },
    { title: "Popular Series", id: RANKING_IDS.popularSeries },
  ];

  const fetched = await Promise.all(
    sections.map(async (section) => {
      const movies = await fetchRanking(section.id, 12);
      return {
        title: section.title,
        movies,
      };
    })
  );

  const allMovies = fetched.flatMap((row) => row.movies);

  const rows = fetched
    .filter((row) => row.movies.length > 0)
    .map((row) => ({
      title: row.title,
      movies: row.movies,
    }));

  return (
    <main className="min-h-full bg-background">
      <Navbar />
      <MovieBrowser rows={rows} heroMovie={heroMovie} allMovies={allMovies} />
      <Footer />
    </main>
  );
}

import { MovieCard } from "@/components/movie-card";
import type { Movie } from "@/lib/movies";

export function CatalogPage({ title, movies }: { title: string; movies: Movie[] }) {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-28 sm:px-8">
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      {movies.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {movies.map((movie) => <MovieCard key={movie.id} movie={movie} gridView />)}
        </div>
      ) : (
        <p className="text-muted-foreground">Titles are temporarily unavailable. Please try again later.</p>
      )}
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { MovieCard } from "@/components/movie-card";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { readMyList, removeMovieFromMyList } from "@/lib/my-list";
import type { Movie } from "@/lib/movies";

export default function MyListPage() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const sync = () => setMovies(readMyList());
    sync();
    window.addEventListener("watchera:my-list-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("watchera:my-list-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-8">
        <h1 className="mb-6 text-3xl font-bold">My List</h1>
        {movies.length ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {movies.map((movie) => (
              <li key={movie.subjectId ?? movie.detailPath ?? movie.id} className="relative">
                <MovieCard movie={movie} gridView />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-2 z-20"
                  aria-label={`Remove ${movie.title} from My List`}
                  title="Remove from My List"
                  onClick={() => removeMovieFromMyList(movie)}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Your list is empty. Add titles from their detail pages.</p>
        )}
      </section>
      <Footer />
    </main>
  );
}
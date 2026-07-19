"use client";

import type { Movie } from "@/lib/movies";
import { MovieCard } from "@/components/movie-card";

export function MovieRow({
  title,
  movies,
  onOpen,
}: {
  title: string;
  movies: Movie[];
  onOpen: (m: Movie) => void;
}) {
  return (
    <section className="px-4 sm:px-8">
      <h2 className="mb-3 text-lg font-semibold text-white sm:text-xl">{title}</h2>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:gap-4">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

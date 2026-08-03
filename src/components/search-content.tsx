"use client";

import { useState } from "react";
import { MovieCard } from "@/components/movie-card";
import { MovieModal } from "@/components/movie-modal";
import type { Movie } from "@/lib/movies";

export function SearchContent({
  query,
  movies,
}: {
  query: string;
  movies: Movie[];
}) {
  const [selected, setSelected] = useState<Movie | null>(null);

  return (
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
            <MovieCard key={m.id} movie={m} onOpen={setSelected} />
          ))}
        </div>
      )}
      <MovieModal key={selected?.id ?? "none"} movie={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

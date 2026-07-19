"use client";

import { useState } from "react";
import { Hero } from "@/components/hero";
import { MovieRow } from "@/components/movie-row";
import { MovieModal } from "@/components/movie-modal";
import type { Movie } from "@/lib/movies";

export function MovieBrowser({
  rows,
  heroMovie,
}: {
  rows: { title: string; movies: Movie[] }[];
  heroMovie: Movie;
}) {
  const [selected, setSelected] = useState<Movie | null>(null);

  return (
    <>
      <Hero movie={heroMovie} onOpen={setSelected} />

      <div className="relative z-10 -mt-16 space-y-8 pb-8">
        {rows.map((row) => (
          <MovieRow
            key={row.title}
            title={row.title}
            movies={row.movies}
            onOpen={setSelected}
          />
        ))}
      </div>

      <MovieModal movie={selected} onClose={() => setSelected(null)} />
    </>
  );
}

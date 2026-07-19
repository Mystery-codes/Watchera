"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { MovieRow } from "@/components/movie-row";
import { MovieModal } from "@/components/movie-modal";
import { Footer } from "@/components/footer";
import { movies, rows, type Movie } from "@/lib/movies";

export default function Home() {
  const [selected, setSelected] = useState<Movie | null>(null);
  const heroMovie = movies[0];

  return (
    <main className="min-h-full bg-background">
      <Navbar />
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

      <Footer />

      <MovieModal movie={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

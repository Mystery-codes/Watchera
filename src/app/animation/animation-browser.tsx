"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MovieRow } from "@/components/movie-row";
import { MovieModal } from "@/components/movie-modal";
import type { Movie } from "@/lib/movies";

export default function AnimationPage({ movies }: { movies: Movie[] }) {
  return (
    <main className="min-h-full bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-8">
        <AnimationContent movies={movies} />
      </div>
      <Footer />
    </main>
  );
}

function AnimationContent({ movies }: { movies: Movie[] }) {
  const [selected, setSelected] = useState<Movie | null>(null);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-white">Animation</h1>
      {movies.length === 0 ? (
        <p className="text-zinc-400">No animation titles available right now.</p>
      ) : (
        <MovieRow title="Animation" movies={movies} onOpen={setSelected} />
      )}
      <MovieModal key={selected?.id ?? "none"} movie={selected} onClose={() => setSelected(null)} />
    </>
  );
}

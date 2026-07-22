"use client";

import { useRef } from "react";
import { ChevronRight } from "lucide-react";
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
  const rowRef = useRef<HTMLDivElement>(null);

  function scrollEnd() {
    rowRef.current?.scrollTo({ left: rowRef.current.scrollWidth, behavior: "smooth" });
  }

  return (
    <section className="relative px-4 sm:px-8">
      <div className="flex items-center justify-between">
        <h2 className="mb-3 text-lg font-semibold text-white sm:text-xl">{title}</h2>
        <button
          onClick={scrollEnd}
          aria-label="Scroll right"
          className="grid size-8 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div
        ref={rowRef}
        className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:gap-4"
      >
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

"use client";

import { useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { MovieCard } from "@/components/movie-card";

export function MovieRow({
  title,
  movies,
  onOpen,
  isGridView: isGridViewProp,
  onToggleGrid: onToggleGridProp,
}: {
  title: string;
  movies: Movie[];
  onOpen: (m: Movie) => void;
  isGridView?: boolean;
  onToggleGrid?: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [internalGridView, setInternalGridView] = useState(false);

  const isGridView = isGridViewProp ?? internalGridView;
  const onToggleGrid = onToggleGridProp ?? (() => setInternalGridView((prev) => !prev));

  return (
    <section className="relative px-4 sm:px-8">
      <div className="flex items-center justify-between">
        <h2 className="mb-3 text-lg font-semibold text-white sm:text-xl">{title}</h2>
        <button
          onClick={onToggleGrid}
          aria-label={isGridView ? "Collapse view" : "See all"}
          className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/20"
        >
          <span>{isGridView ? "Collapse" : "See All"}</span>
          <ChevronRight
            className={`size-4 transition-transform duration-300 ${
              isGridView ? "rotate-90" : ""
            }`}
          />
        </button>
      </div>
      <div
        ref={rowRef}
        className={isGridView
          ? "grid grid-cols-2 gap-3 py-4 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          : "no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:gap-4"}
      >
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} onOpen={onOpen} gridView={isGridView} />
        ))}
      </div>
    </section>
  );
}

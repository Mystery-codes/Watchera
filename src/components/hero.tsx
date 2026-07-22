"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, Info } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { Button } from "@/components/ui/button";

export function Hero({
  movie: initialMovie,
  onOpen,
  allMovies,
}: {
  movie: Movie;
  onOpen: (m: Movie) => void;
  allMovies: Movie[];
}) {
  const [movie, setMovie] = useState(initialMovie);

  useEffect(() => {
    if (!allMovies.length) return;
    const interval = setInterval(() => {
      const candidates = allMovies.filter((m) => m.id !== movie.id);
      const pool = candidates.length ? candidates : allMovies;
      const next = pool[Math.floor(Math.random() * pool.length)];
      setMovie(next);
    }, 6000);
    return () => clearInterval(interval);
  }, [allMovies, movie.id]);

  return (
    <section className="relative h-[85vh] min-h-[520px] w-full">
      <Image
        src={movie.banner}
        alt={movie.title}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

      <div
        data-aos="fade-up"
        className="absolute bottom-[12%] left-0 max-w-xl px-4 sm:px-8"
      >
        <h1 className="text-4xl font-extrabold sm:text-6xl">{movie.title}</h1>
        <p className="mt-4 line-clamp-3 max-w-md text-sm text-zinc-200 sm:text-base">
          {movie.description}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={() => onOpen(movie)}>
            <Play className="size-4 fill-white" /> Play
          </Button>
          <Button size="lg" variant="secondary" onClick={() => onOpen(movie)}>
            <Info className="size-4" /> More Info
          </Button>
        </div>
      </div>
    </section>
  );
}

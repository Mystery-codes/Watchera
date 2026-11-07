"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Plus, ThumbsUp } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { getTitlePath } from "@/lib/seo";

export function MovieCard({
  movie,
  onOpen,
  gridView = false,
}: {
  movie: Movie;
  onOpen?: (m: Movie) => void;
  gridView?: boolean;
}) {
  const href = getTitlePath(movie);

  return (
    <Link
      href={href}
      data-aos="fade-up"
      onClick={(event) => {
        if (onOpen) {
          event.preventDefault();
          onOpen(movie);
        }
      }}
      className={`group relative overflow-hidden rounded-md transition-transform duration-300 hover:z-10 hover:scale-105 ${
        gridView ? "w-full" : "w-40 shrink-0 sm:w-48"
      }`}
    >
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={movie.poster}
          alt={movie.title}
          fill
          sizes={
            gridView
              ? "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16.66vw"
              : "192px"
          }
          className="rounded-md object-cover"
        />
        <div className="absolute inset-0 rounded-md bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 flex translate-y-2 flex-col gap-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-sm font-semibold text-white">{movie.title}</span>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-white/90 text-black">
              <Play className="size-3 fill-black" />
            </span>
            <span className="grid size-7 place-items-center rounded-full border border-white/60 text-white">
              <Plus className="size-3" />
            </span>
            <span className="grid size-7 place-items-center rounded-full border border-white/60 text-white">
              <ThumbsUp className="size-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

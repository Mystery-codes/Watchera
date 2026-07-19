"use client";

import Image from "next/image";
import { Play, Plus, ThumbsUp, X } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MovieModal({
  movie,
  onClose,
}: {
  movie: Movie | null;
  onClose: () => void;
}) {
  if (!movie) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-lg bg-card text-card-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="relative aspect-video w-full">
          <Image src={movie.banner} alt={movie.title} fill sizes="768px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>

        <div className="space-y-4 p-6">
          <h1 className="text-3xl font-extrabold">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-semibold text-green-500">98% Match</span>
            <span>{movie.year}</span>
            <Badge variant="outline">{movie.rating}</Badge>
            <span>{movie.duration}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <Play className="size-4 fill-white" /> Play
            </Button>
            <Button variant="secondary" size="icon" aria-label="Add to list">
              <Plus className="size-4" />
            </Button>
            <Button variant="secondary" size="icon" aria-label="Like">
              <ThumbsUp className="size-4" />
            </Button>
          </div>

          <p className="text-sm leading-relaxed text-zinc-300">{movie.description}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            {movie.genres.map((g) => (
              <Badge key={g} className="bg-secondary text-secondary-foreground">
                {g}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

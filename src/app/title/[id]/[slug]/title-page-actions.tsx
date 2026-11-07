"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { MovieModal } from "@/components/movie-modal";
import { Button } from "@/components/ui/button";
import type { Movie } from "@/lib/movies";

export function TitlePageActions({ movie }: { movie: Movie }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Play className="size-4 fill-current" />
        Play
      </Button>
      {isOpen && <MovieModal movie={movie} onClose={() => setIsOpen(false)} />}
    </>
  );
}
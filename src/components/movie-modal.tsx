"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, Plus, ThumbsUp, X } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoviePlayer } from "@/components/movie-player";
import { SeasonEpisodePicker } from "@/components/season-episode-picker";

export function MovieModal({
  movie,
  onClose,
}: {
  movie: Movie | null;
  onClose: () => void;
}) {
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [seasonsList, setSeasonsList] = useState<
    { season: number; episodes: number }[]
  >([]);
  const [seasonsLoading, setSeasonsLoading] = useState(false);

  const isSeries = Number(movie?.subjectType) === 2;
  const streamEnabled = process.env.NEXT_PUBLIC_STREAM_ENABLED === "true";

  useEffect(() => {
    if (!movie || !isSeries || !movie.subjectId) {
      setSeasonsList([]);
      return;
    }
    let cancelled = false;
    setSeasonsLoading(true);
    setSeasonsList([]);
    setSeason(1);
    setEpisode(1);
    fetch(`/api/episodes?subjectId=${encodeURIComponent(movie.subjectId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load episodes");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data?.seasons?.length) {
          setSeasonsList(data.seasons);
          setSeason(data.seasons[0].season);
          setEpisode(1);
        }
      })
      .catch((err) => {
        console.error("Episodes fetch error:", err);
      })
      .finally(() => {
        if (!cancelled) setSeasonsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isSeries, movie?.detailPath, movie?.id]);

  function handleSeasonChange(s: number) {
    setSeason(s);
    setEpisode(1);
  }

  function handleEpisodeChange(ep: number) {
    setEpisode(ep);
  }

  if (!movie) return null;

  const playId = movie.detailPath ?? String(movie.id);

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

        {streamEnabled ? (
          <MoviePlayer
            detailPath={playId}
            type={movie.subjectType ?? 1}
            sea={isSeries ? season : 0}
            eps={isSeries ? episode : 0}
          />
        ) : (
          <div className="relative aspect-video w-full">
            <Image
              src={movie.banner}
              alt={movie.title}
              fill
              sizes="768px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          </div>
        )}

        <div className="space-y-4 p-6">
          <h1 className="text-3xl font-extrabold">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-semibold text-green-500">98% Match</span>
            <span>{movie.year}</span>
            <Badge variant="outline">{movie.rating}</Badge>
            <span>{movie.duration}</span>
          </div>

          {isSeries && seasonsLoading && (
            <p className="text-xs text-muted-foreground">Loading episodes...</p>
          )}

          {isSeries && !seasonsLoading && seasonsList.length > 0 && (
            <SeasonEpisodePicker
              seasons={seasonsList}
              selectedSeason={season}
              selectedEpisode={episode}
              onSeasonChange={handleSeasonChange}
              onEpisodeChange={handleEpisodeChange}
            />
          )}

          {isSeries && !seasonsLoading && seasonsList.length === 0 && (
            <p className="text-xs text-muted-foreground">Episode info unavailable for this title.</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={!streamEnabled}>
              <Play className="size-4 fill-white" /> Play
            </Button>
            <Button variant="secondary" size="icon" aria-label="Add to list">
              <Plus className="size-4" />
            </Button>
            <Button variant="secondary" size="icon" aria-label="Like">
              <ThumbsUp className="size-4" />
            </Button>
          </div>

          {!streamEnabled && (
            <p className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
              Playback is disabled — set{" "}
              <code>PLEXHD_STREAM_TOKEN</code> in your environment to enable
              streaming.
            </p>
          )}

          <p className="text-sm leading-relaxed text-zinc-300">
            {movie.description || "No description available."}
          </p>

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

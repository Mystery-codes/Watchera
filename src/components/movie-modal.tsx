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
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [details, setDetails] = useState<{
    description?: string;
    title?: string;
    year?: number;
    rating?: string;
    duration?: string;
    genres?: string[];
    poster?: string;
    banner?: string;
    subjectType?: number;
  }>({});

  const displayMovie = {
    ...movie,
    ...details,
  };

  const isSeries = Number(displayMovie.subjectType ?? movie?.subjectType ?? 2) === 2;
  const streamEnabled = process.env.NEXT_PUBLIC_STREAM_ENABLED === "true";

  const playId = displayMovie.detailPath ?? movie?.detailPath ?? String(displayMovie.id ?? movie?.id);

  useEffect(() => {
    if (!movie) return;
    const idOrPath = movie.subjectId ?? movie.detailPath ?? String(movie.id);
    if (!idOrPath) return;

    let cancelled = false;

    if (isSeries) {
      setSeasonsLoading(true);
      setSeasonsList([]);
      setSeason(1);
      setEpisode(1);
    }

    setDetailsLoading(true);
    setDetails({});

    fetch(`/api/episodes?id=${encodeURIComponent(idOrPath)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load details");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setDetails({
          description: data.description ?? movie.description ?? "",
          title: data.title ?? movie.title,
          year: data.year ?? movie.year,
          rating: data.rating ?? movie.rating,
          duration: data.duration ?? movie.duration,
          genres: data.genres?.length ? data.genres : movie.genres,
          poster: data.poster ?? movie.poster,
          banner: data.banner ?? movie.banner,
          subjectType: data.subjectType ?? movie.subjectType,
        });

        if (isSeries && data.seasons?.length) {
          setSeasonsList(data.seasons);
          setSeason(data.seasons[0].season);
          setEpisode(1);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Details fetch error:", err);
          setDetailsError(err instanceof Error ? err.message : "Failed to load synopsis");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSeasonsLoading(false);
          setDetailsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isSeries, movie?.detailPath, movie?.subjectId, movie?.id]);

  function handleSeasonChange(s: number) {
    setSeason(s);
    setEpisode(1);
  }

  function handleEpisodeChange(ep: number) {
    setEpisode(ep);
  }

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

        {streamEnabled ? (
          <MoviePlayer
            detailPath={playId}
            type={displayMovie.subjectType ?? movie.subjectType ?? 1}
            sea={isSeries ? season : 0}
            eps={isSeries ? episode : 0}
          />
        ) : (
          <div className="relative aspect-video w-full">
            <Image
              src={displayMovie.banner ?? movie.banner}
              alt={displayMovie.title ?? movie.title}
              fill
              sizes="768px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          </div>
        )}

        <div className="space-y-4 p-6">
          <h1 className="text-3xl font-extrabold">{displayMovie.title ?? movie.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-semibold text-green-500">98% Match</span>
            <span>{displayMovie.year ?? movie.year}</span>
            <Badge variant="outline">{displayMovie.rating ?? movie.rating}</Badge>
            <span>{displayMovie.duration ?? movie.duration}</span>
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

          {detailsLoading ? (
            <p className="text-sm leading-relaxed text-muted-foreground">Loading synopsis...</p>
          ) : detailsError ? (
            <p className="text-sm leading-relaxed text-destructive">{detailsError}</p>
          ) : (
            <p className="text-sm leading-relaxed text-zinc-300">
              {displayMovie.description || "No description available."}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {(displayMovie.genres?.length ? displayMovie.genres : movie.genres).map((g) => (
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

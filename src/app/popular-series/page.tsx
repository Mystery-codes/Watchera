"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MovieCard } from "@/components/movie-card";
import type { Movie } from "@/lib/movies";
import { Button } from "@/components/ui/button";
import { SeasonEpisodePicker } from "@/components/season-episode-picker";

export default function PopularSeriesPage() {
  const [series, setSeries] = useState<Movie[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Movie | null>(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [seasonsList, setSeasonsList] = useState<
    { season: number; episodes: number }[]
  >([]);
  const [seasonsLoading, setSeasonsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch("/api/popular-series")
      .then((res) => (res.ok ? res.json() : []))
      .then(setSeries);
  }, []);

  const isSeries = Number(selectedSeries?.subjectType) === 2;

  function openPlayer(m: Movie) {
    setSelectedSeries(m);
    setSeason(1);
    setEpisode(1);
    setIsPlaying(true);

    if (m.subjectType === 2 && m.subjectId) {
      setSeasonsLoading(true);
      setSeasonsList([]);
      fetch(`/api/episodes?subjectId=${encodeURIComponent(m.subjectId)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load episodes");
          return res.json();
        })
        .then((data) => {
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
          setSeasonsLoading(false);
        });
    } else {
      setSeasonsList([]);
      setSeasonsLoading(false);
    }
  }

  return (
    <main className="min-h-full bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-8">
        <h1 className="mb-6 text-2xl font-bold text-white">Popular Series</h1>
        {series.length === 0 ? (
          <p className="text-zinc-400">No series available right now.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {series.map((s) => (
              <MovieCard key={s.id} movie={s} onOpen={openPlayer} />
            ))}
          </div>
        )}
      </div>

      {selectedSeries && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 sm:p-8"
          onClick={() => {
            setIsPlaying(false);
            setSelectedSeries(null);
          }}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-lg bg-card text-card-foreground shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setIsPlaying(false);
                setSelectedSeries(null);
              }}
              className="absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
              aria-label="Close"
            >
              ✕
            </button>

            {isPlaying && selectedSeries.detailPath ? (
              <div className="overflow-hidden rounded-lg bg-black">
                <video
                  controls
                  autoPlay
                  playsInline
                  className="aspect-video w-full bg-black"
                  src={`/api/play?detailPath=${encodeURIComponent(selectedSeries.detailPath)}&type=${encodeURIComponent(selectedSeries.subjectType ?? 2)}${isSeries ? `&sea=${encodeURIComponent(season)}&eps=${encodeURIComponent(episode)}` : ""}`}
                />
              </div>
            ) : (
              <div className="relative aspect-video w-full">
                <img
                  src={selectedSeries.banner}
                  alt={selectedSeries.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
            )}

            <div className="space-y-4 p-6">
              <h1 className="text-3xl font-extrabold">{selectedSeries.title}</h1>

              {isSeries && seasonsLoading && (
                <p className="text-xs text-muted-foreground">Loading episodes...</p>
              )}

              {isSeries && !seasonsLoading && seasonsList.length > 0 && (
                <SeasonEpisodePicker
                  seasons={seasonsList}
                  selectedSeason={season}
                  selectedEpisode={episode}
                  onSeasonChange={setSeason}
                  onEpisodeChange={setEpisode}
                />
              )}

              {isSeries && !seasonsLoading && seasonsList.length === 0 && (
                <p className="text-xs text-muted-foreground">Episode info unavailable for this title.</p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => setIsPlaying(true)}>
                  ▶ Play
                </Button>
              </div>

              <p className="text-sm leading-relaxed text-zinc-300">
                {selectedSeries.description || "No description available."}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {selectedSeries.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-md border border-border bg-secondary/40 px-2 py-1 text-xs text-secondary-foreground"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MovieCard } from "@/components/movie-card";
import type { Movie } from "@/lib/movies";
import { Button } from "@/components/ui/button";

const DEFAULT_EPISODES = 12;

export default function PopularSeriesPage() {
  const [series, setSeries] = useState<Movie[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Movie | null>(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch("/api/popular-series")
      .then((res) => (res.ok ? res.json() : []))
      .then(setSeries);
  }, []);

  function openPlayer(m: Movie) {
    setSelectedSeries(m);
    setSeason(1);
    setEpisode(1);
    setIsPlaying(true);
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
                  src={`/api/play?detailPath=${encodeURIComponent(selectedSeries.detailPath)}&type=${encodeURIComponent(selectedSeries.subjectType ?? 2)}&sea=${encodeURIComponent(season)}&eps=${encodeURIComponent(episode)}`}
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

              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-muted-foreground">Season</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(Number(e.target.value))}
                  className="rounded-md border border-border bg-secondary/40 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>
                      Season {s}
                    </option>
                  ))}
                </select>

                <label className="text-sm text-muted-foreground">Episode</label>
                <select
                  value={episode}
                  onChange={(e) => setEpisode(Number(e.target.value))}
                  className="rounded-md border border-border bg-secondary/40 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Array.from({ length: DEFAULT_EPISODES }, (_, i) => i + 1).map((ep) => (
                    <option key={ep} value={ep}>
                      Episode {ep}
                    </option>
                  ))}
                </select>
              </div>

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

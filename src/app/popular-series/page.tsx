"use client";

import { useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MovieCard } from "@/components/movie-card";
import type { Movie } from "@/lib/movies";
import { Button } from "@/components/ui/button";
import { SeasonEpisodePicker } from "@/components/season-episode-picker";
import {
  deleteDownloadedVideo,
  getDownloadedVideo,
  getOfflineVideoKey,
  saveDownloadedVideo,
  type OfflineDownloadMeta,
} from "@/lib/offline-downloads";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [offlineRecord, setOfflineRecord] = useState<OfflineDownloadMeta | null>(null);
  const [offlineBlob, setOfflineBlob] = useState<Blob | null>(null);
  const [downloadChoiceOpen, setDownloadChoiceOpen] = useState(false);

  useEffect(() => {
    fetch("/api/popular-series")
      .then((res) => (res.ok ? res.json() : []))
      .then(setSeries);
  }, []);

  const isSeries = Number(selectedSeries?.subjectType) === 2;
  const playId = selectedSeries?.detailPath ?? (selectedSeries ? String(selectedSeries.id) : "");
  const offlineKey = selectedSeries
    ? getOfflineVideoKey({
        detailPath: playId,
        type: selectedSeries.subjectType ?? 2,
        sea: isSeries ? season : 0,
        eps: isSeries ? episode : 0,
      })
    : "";

  useEffect(() => {
    if (!selectedSeries || !playId) return;
    setOfflineRecord(null);
    setOfflineBlob(null);

    getDownloadedVideo(offlineKey)
      .then((record) => {
        if (!record) return;
        setOfflineRecord({ ...record, url: record.url ?? "" });
        setOfflineBlob(record.blob ?? null);
      })
      .catch(() => {
        setOfflineRecord(null);
        setOfflineBlob(null);
      });
  }, [selectedSeries, playId, offlineKey]);

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

  async function handleDownloadToDevice() {
    if (!selectedSeries) return;
    const downloadUrl = `/api/play?detailPath=${encodeURIComponent(playId)}&type=${encodeURIComponent(selectedSeries.subjectType ?? 2)}&sea=${encodeURIComponent(isSeries ? season : 0)}&eps=${encodeURIComponent(isSeries ? episode : 0)}`;

    setDownloading(true);
    setDownloadProgress(null);
    setDownloadChoiceOpen(false);

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const contentLength = Number(response.headers.get("Content-Length")) || 0;
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Streaming not supported in this browser");
      }

      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (contentLength > 0) {
          setDownloadProgress(Math.round((received / contentLength) * 100));
        }
      }

      const blob = new Blob(chunks as BlobPart[], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const fileName = `${(selectedSeries.title ?? "download").replace(/[^a-z0-9]/gi, "_")}_${isSeries ? `S${season}_E${episode}` : ""}.mp4`;
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadProgress(null);
    } catch (err) {
      console.error("Download error:", err);
      alert(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadToWatchera() {
    if (!selectedSeries) return;
    if (offlineRecord) {
      setDownloadChoiceOpen(false);
      return;
    }

    const downloadUrl = `/api/play?detailPath=${encodeURIComponent(playId)}&type=${encodeURIComponent(selectedSeries.subjectType ?? 2)}&sea=${encodeURIComponent(isSeries ? season : 0)}&eps=${encodeURIComponent(isSeries ? episode : 0)}`;

    setDownloading(true);
    setDownloadProgress(null);
    setDownloadChoiceOpen(false);

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const contentLength = Number(response.headers.get("Content-Length")) || 0;
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Streaming not supported in this browser");
      }

      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (contentLength > 0) {
          setDownloadProgress(Math.round((received / contentLength) * 100));
        }
      }

      const blob = new Blob(chunks as BlobPart[], { type: "video/mp4" });
      const saved = await saveDownloadedVideo(
        {
          key: offlineKey,
          title: selectedSeries.title,
          detailPath: playId,
          type: selectedSeries.subjectType ?? 2,
          sea: isSeries ? season : 0,
          eps: isSeries ? episode : 0,
        },
        blob
      );

      setOfflineRecord(saved);
      setOfflineBlob(blob);
      setDownloadProgress(null);
    } catch (err) {
      console.error("Download error:", err);
      alert(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDeleteOffline() {
    try {
      await deleteDownloadedVideo(offlineKey);
      setOfflineRecord(null);
      setOfflineBlob(null);
    } catch (err) {
      console.error("Delete download error:", err);
      alert(err instanceof Error ? err.message : "Failed to remove download");
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

            {isPlaying && (selectedSeries.detailPath || offlineBlob) ? (
              <div className="overflow-hidden rounded-lg bg-black">
                <video
                  controls
                  autoPlay
                  playsInline
                  className="aspect-video w-full bg-black"
                  src={
                    offlineBlob
                      ? URL.createObjectURL(offlineBlob)
                      : `/api/play?detailPath=${encodeURIComponent(selectedSeries.detailPath ?? String(selectedSeries.id))}&type=${encodeURIComponent(selectedSeries.subjectType ?? 2)}${isSeries ? `&sea=${encodeURIComponent(season)}&eps=${encodeURIComponent(episode)}` : ""}`
                  }
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
                {offlineRecord ? (
                  <Button
                    variant="secondary"
                    onClick={handleDeleteOffline}
                    className="flex items-center gap-2"
                    aria-label="Remove downloaded video"
                  >
                    <Trash2 className="size-4" />
                    <span>Remove</span>
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setDownloadChoiceOpen(true)}
                    disabled={downloading}
                    aria-label="Choose download destination"
                    className="flex items-center gap-2"
                  >
                    {downloading ? (
                      <>
                        <svg
                          className="-ml-1 size-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 8 0 16 8 8 0 0 8-8-16z"
                          />
                        </svg>
                        <span>{downloadProgress ?? 0}%</span>
                      </>
                    ) : (
                      <>
                        <Download className="size-4" />
                        <span>Download</span>
                      </>
                    )}
                  </Button>
                )}
              </div>

              {offlineRecord && (
                <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  Available offline for viewing without internet.
                </p>
              )}

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

      <Dialog open={downloadChoiceOpen} onOpenChange={setDownloadChoiceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose download destination</DialogTitle>
            <DialogDescription>
              Save this title to your device or keep it inside Watchera for offline viewing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Button onClick={handleDownloadToDevice} className="justify-center">
              <Download className="size-4" />
              Download to device
            </Button>
            <Button variant="secondary" onClick={handleDownloadToWatchera} className="justify-center">
              <Download className="size-4" />
              Download to Watchera
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDownloadChoiceOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}

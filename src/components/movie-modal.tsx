"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, Plus, ThumbsUp, X, Download, Trash2 } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoviePlayer } from "@/components/movie-player";
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

export function MovieModal({
  movie,
  onClose,
  onDownloadChange,
}: {
  movie: Movie | null;
  onClose: () => void;
  onDownloadChange?: () => void | Promise<void>;
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
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [offlineRecord, setOfflineRecord] = useState<OfflineDownloadMeta | null>(null);
  const [offlineBlob, setOfflineBlob] = useState<Blob | null>(null);
  const [downloadChoiceOpen, setDownloadChoiceOpen] = useState(false);

  const displayMovie = {
    ...movie,
    ...details,
  };

  const isSeries = Number(displayMovie.subjectType ?? movie?.subjectType ?? 2) === 2;
  const streamEnabled = process.env.NEXT_PUBLIC_STREAM_ENABLED === "true";

  const playId = displayMovie.detailPath ?? movie?.detailPath ?? String(displayMovie.id ?? movie?.id);
  const offlineKey = getOfflineVideoKey({
    detailPath: playId,
    type: displayMovie.subjectType ?? movie?.subjectType ?? 1,
    sea: isSeries ? season : 0,
    eps: isSeries ? episode : 0,
  });

  useEffect(() => {
    if (!movie || !playId) return;
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
  }, [movie, offlineKey, playId]);

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

  async function handleDownloadToDevice() {
    if (!movie) return;
    const downloadUrl = `/api/play?detailPath=${encodeURIComponent(playId)}&type=${encodeURIComponent(displayMovie.subjectType ?? movie.subjectType ?? 1)}&sea=${encodeURIComponent(isSeries ? season : 0)}&eps=${encodeURIComponent(isSeries ? episode : 0)}`;

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
      const fileName = `${(displayMovie.title ?? movie.title).replace(/[^a-z0-9]/gi, "_")}_${isSeries ? `S${season}_E${episode}` : ""}.mp4`;
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
    if (!movie) return;
    if (offlineRecord) {
      setDownloadChoiceOpen(false);
      return;
    }

    const downloadUrl = `/api/play?detailPath=${encodeURIComponent(playId)}&type=${encodeURIComponent(displayMovie.subjectType ?? movie.subjectType ?? 1)}&sea=${encodeURIComponent(isSeries ? season : 0)}&eps=${encodeURIComponent(isSeries ? episode : 0)}`;

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
          title: displayMovie.title ?? movie.title,
          detailPath: playId,
          type: displayMovie.subjectType ?? movie.subjectType ?? 1,
          sea: isSeries ? season : 0,
          eps: isSeries ? episode : 0,
        },
        blob
      );

      setOfflineRecord(saved);
      setOfflineBlob(blob);
      setDownloadProgress(null);
      await onDownloadChange?.();
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
      await onDownloadChange?.();
    } catch (err) {
      console.error("Delete download error:", err);
      alert(err instanceof Error ? err.message : "Failed to remove download");
    }
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

        {streamEnabled || offlineBlob ? (
          <MoviePlayer
            detailPath={playId}
            type={displayMovie.subjectType ?? movie.subjectType ?? 1}
            sea={isSeries ? season : 0}
            eps={isSeries ? episode : 0}
            offlineBlob={offlineBlob}
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
            <Button disabled={!streamEnabled && !offlineBlob}>
              <Play className="size-4 fill-white" /> Play
            </Button>
            <Button variant="secondary" size="icon" aria-label="Add to list">
              <Plus className="size-4" />
            </Button>
            <Button variant="secondary" size="icon" aria-label="Like">
              <ThumbsUp className="size-4" />
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
                disabled={downloading || !streamEnabled}
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
    </div>
  );
}

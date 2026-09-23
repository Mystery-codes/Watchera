"use client";

import { useEffect, useState } from "react";
import { Download, Play, Trash2 } from "lucide-react";
import { Footer } from "@/components/footer";
import { MoviePlayer } from "@/components/movie-player";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  deleteDownloadedVideo,
  getDownloadedVideo,
  listDownloadedVideos,
  type OfflineDownloadMeta,
} from "@/lib/offline-downloads";

type SelectedDownload = OfflineDownloadMeta & { blob: Blob };

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<OfflineDownloadMeta[]>([]);
  const [selected, setSelected] = useState<SelectedDownload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshDownloads() {
    setLoading(true);
    setError(null);
    try {
      setDownloads(await listDownloadedVideos());
    } catch (err) {
      setDownloads([]);
      setError(err instanceof Error ? err.message : "Could not load downloads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshDownloads();
  }, []);

  async function playDownload(download: OfflineDownloadMeta) {
    try {
      const record = await getDownloadedVideo(download.key);
      if (!record?.blob) throw new Error("This downloaded video is no longer available.");
      setSelected({ ...download, blob: record.blob });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not play this download.");
    }
  }

  async function removeDownload(download: OfflineDownloadMeta) {
    await deleteDownloadedVideo(download.key);
    if (selected?.key === download.key) setSelected(null);
    await refreshDownloads();
  }

  return (
    <main className="min-h-full bg-background">
      <Navbar />
      <section className="mx-auto min-h-screen max-w-7xl px-4 pt-24 pb-12 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Download className="size-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Offline library</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Downloads</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Videos saved to Watchera are available here without an internet connection.
            </p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-zinc-200">
            {downloads.length} saved
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading downloads…</p>
        ) : error ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </p>
        ) : downloads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-8 text-center">
            <Download className="mx-auto size-9 text-zinc-500" />
            <h2 className="mt-4 text-lg font-semibold text-white">No Watchera downloads yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use “Download to Watchera” on a movie or series to save it here for offline viewing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {downloads.map((download) => (
              <article key={download.key} className="rounded-xl border border-white/10 bg-zinc-900/80 p-4">
                <h2 className="line-clamp-2 text-base font-semibold text-white">{download.title}</h2>
                <p className="mt-2 text-xs text-zinc-400">
                  {formatSize(download.size)} · Saved {new Date(download.createdAt).toLocaleDateString()}
                </p>
                {download.sea > 0 && (
                  <p className="mt-1 text-xs text-zinc-400">Season {download.sea}, Episode {download.eps}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => void playDownload(download)} className="flex-1">
                    <Play className="size-3.5 fill-white" /> Play offline
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void removeDownload(download)}
                    aria-label={`Remove ${download.title}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 className="line-clamp-1 text-lg font-semibold text-white">{selected.title}</h2>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Close</Button>
            </div>
            <MoviePlayer detailPath={selected.detailPath} type={selected.type} sea={selected.sea} eps={selected.eps} offlineBlob={selected.blob} />
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
}

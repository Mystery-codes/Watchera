"use client";

import { useEffect, useState } from "react";
import { Play, Trash2 } from "lucide-react";
import { Hero } from "@/components/hero";
import { MovieRow } from "@/components/movie-row";
import { MovieModal } from "@/components/movie-modal";
import type { Movie } from "@/lib/movies";
import { Button } from "@/components/ui/button";
import {
  deleteDownloadedVideo,
  listDownloadedVideos,
  type OfflineDownloadMeta,
} from "@/lib/offline-downloads";

export function MovieBrowser({
  rows,
  heroMovie,
  allMovies,
}: {
  rows: { title: string; movies: Movie[] }[];
  heroMovie: Movie;
  allMovies: Movie[];
}) {
  const [selected, setSelected] = useState<Movie | null>(null);
  const [isGridView, setIsGridView] = useState(false);
  const [downloads, setDownloads] = useState<OfflineDownloadMeta[]>([]);
  const [selectedDownload, setSelectedDownload] = useState<
    (OfflineDownloadMeta & { blob?: Blob }) | null
  >(null);

  async function refreshDownloads() {
    try {
      const items = await listDownloadedVideos();
      setDownloads(items);
    } catch {
      setDownloads([]);
    }
  }

  useEffect(() => {
    void refreshDownloads();
  }, []);

  return (
    <>
      <Hero movie={heroMovie} onOpen={setSelected} allMovies={allMovies} />

      <div className="relative z-10 -mt-16 space-y-8 pb-8">
        {rows.map((row) => (
          <MovieRow
            key={row.title}
            title={row.title}
            movies={row.movies}
            onOpen={setSelected}
            isGridView={isGridView}
            onToggleGrid={() => setIsGridView((prev) => !prev)}
          />
        ))}

        <section className="relative px-4 sm:px-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white sm:text-xl">Downloads</h2>
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-zinc-200">
              {downloads.length} saved
            </span>
          </div>

          {downloads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-5 text-sm text-zinc-300">
              No videos saved to Watchera yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {downloads.map((download) => (
                <div
                  key={download.key}
                  className="rounded-xl border border-white/10 bg-zinc-900/80 p-3"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white line-clamp-2">
                      {download.title}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {(download.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        const record = await import("@/lib/offline-downloads").then((mod) =>
                          mod.getDownloadedVideo(download.key)
                        );
                        setSelectedDownload({
                          ...download,
                          blob: record?.blob,
                        });
                      }}
                      className="flex-1"
                    >
                      <Play className="size-3.5 fill-white" />
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await deleteDownloadedVideo(download.key);
                        await refreshDownloads();
                      }}
                      aria-label={`Delete ${download.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedDownload && selectedDownload.blob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-card">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h3 className="text-lg font-semibold text-white">{selectedDownload.title}</h3>
              <button
                onClick={() => setSelectedDownload(null)}
                className="rounded-full bg-white/10 px-2 py-1 text-sm text-white"
              >
                Close
              </button>
            </div>
            <video
              controls
              autoPlay
              playsInline
              className="aspect-video w-full bg-black"
              src={URL.createObjectURL(selectedDownload.blob)}
            />
          </div>
        </div>
      )}

      <MovieModal
        key={selected?.id ?? "none"}
        movie={selected}
        onClose={() => setSelected(null)}
        onDownloadChange={refreshDownloads}
      />
    </>
  );
}

"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Download, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteOfflineQueueItem,
  getDownloadedVideo,
  listOfflineQueue,
  saveDownloadedVideo,
  saveOfflineQueueItem,
  type OfflineQueueItem,
} from "@/lib/offline-downloads";

type NewOfflineQueueItem = Pick<
  OfflineQueueItem,
  "key" | "title" | "detailPath" | "type" | "sea" | "eps"
>;

type DownloadQueueContextValue = {
  items: OfflineQueueItem[];
  ready: boolean;
  enqueue: (item: NewOfflineQueueItem) => Promise<void>;
  retry: (key: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
};

const DownloadQueueContext = createContext<DownloadQueueContextValue | null>(null);

export function useDownloadQueue() {
  const context = useContext(DownloadQueueContext);
  if (!context) throw new Error("useDownloadQueue must be used within DownloadQueueProvider.");
  return context;
}

export function DownloadQueueProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OfflineQueueItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [workerWake, setWorkerWake] = useState(0);
  const itemsRef = useRef<OfflineQueueItem[]>([]);
  const processingRef = useRef(false);
  const addingKeysRef = useRef(new Set<string>());

  function commitItem(item: OfflineQueueItem) {
    setItems((current) => {
      const next = current.some((entry) => entry.key === item.key)
        ? current.map((entry) => (entry.key === item.key ? item : entry))
        : [...current, item].sort((a, b) => a.createdAt - b.createdAt);
      itemsRef.current = next;
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function restoreQueue() {
      try {
        const stored = await listOfflineQueue();
        const restored = stored.map((item) =>
          item.status === "downloading"
            ? { ...item, status: "queued" as const, progress: null }
            : item
        );

        await Promise.all(
          restored
            .filter((item, index) => item !== stored[index])
            .map(saveOfflineQueueItem)
        );

        if (cancelled) return;
        itemsRef.current = restored;
        setItems(restored);
        setOpen(restored.some((item) => item.status === "queued" || item.status === "downloading"));
      } catch (error) {
        console.error("Could not restore download queue:", error);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void restoreQueue();
    return () => {
      cancelled = true;
    };
  }, []);

  async function processItem(item: OfflineQueueItem) {
    const activeItem: OfflineQueueItem = {
      ...item,
      status: "downloading",
      progress: 0,
      error: undefined,
    };

    try {
      await saveOfflineQueueItem(activeItem);
      commitItem(activeItem);

      const url = `/api/play?detailPath=${encodeURIComponent(item.detailPath)}&type=${encodeURIComponent(String(item.type))}&sea=${encodeURIComponent(String(item.sea))}&eps=${encodeURIComponent(String(item.eps))}&stream=1`;
      const response = await fetch(url);
      if (!response.ok) {
        const message = await response.text().catch(() => response.statusText);
        throw new Error(`Download failed: ${response.status} ${message}`);
      }

      const contentLength = Number(response.headers.get("Content-Length")) || 0;
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Streaming is not supported in this browser.");

      const chunks: Uint8Array[] = [];
      let received = 0;
      let lastProgress = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (contentLength > 0) {
          const progress = Math.round((received / contentLength) * 100);
          if (progress !== lastProgress) {
            lastProgress = progress;
            const progressItem = { ...activeItem, progress };
            setItems((current) => {
              const next = current.map((entry) => (entry.key === item.key ? progressItem : entry));
              itemsRef.current = next;
              return next;
            });
          }
        }
      }

      await saveDownloadedVideo(
        {
          key: item.key,
          title: item.title,
          detailPath: item.detailPath,
          type: item.type,
          sea: item.sea,
          eps: item.eps,
        },
        new Blob(chunks as BlobPart[], { type: "video/mp4" })
      );

      await saveOfflineQueueItem({ ...activeItem, status: "completed", progress: 100 });
      commitItem({ ...activeItem, status: "completed", progress: 100 });
      window.dispatchEvent(new Event("watchera:downloads-changed"));
    } catch (error) {
      const failedItem: OfflineQueueItem = {
        ...activeItem,
        status: "failed",
        progress: null,
        error: error instanceof Error ? error.message : "Download failed.",
      };
      try {
        await saveOfflineQueueItem(failedItem);
      } catch (saveError) {
        console.error("Could not save failed queue item:", saveError);
      }
      commitItem(failedItem);
    }
  }

  const processItemRef = useRef(processItem);
  processItemRef.current = processItem;

  useEffect(() => {
    if (!ready || processingRef.current) return;
    const next = items.find((item) => item.status === "queued");
    if (!next) return;

    processingRef.current = true;
    void processItemRef.current(next).finally(() => {
      processingRef.current = false;
      setWorkerWake((value) => value + 1);
    });
  }, [items, ready, workerWake]);

  async function enqueue(item: NewOfflineQueueItem) {
    if (!ready || addingKeysRef.current.has(item.key)) return;
    addingKeysRef.current.add(item.key);

    try {
      const existing = itemsRef.current.find((entry) => entry.key === item.key);
      if (existing?.status === "queued" || existing?.status === "downloading") return;
      if (await getDownloadedVideo(item.key)) return;

      const queueItem: OfflineQueueItem = {
        ...item,
        createdAt: existing?.createdAt ?? Date.now(),
        status: "queued",
        progress: null,
      };
      await saveOfflineQueueItem(queueItem);
      commitItem(queueItem);
      setOpen(true);
    } finally {
      addingKeysRef.current.delete(item.key);
    }
  }

  async function retry(key: string) {
    const item = itemsRef.current.find((entry) => entry.key === key);
    if (!item || item.status !== "failed") return;
    const queuedItem: OfflineQueueItem = { ...item, status: "queued", progress: null, error: undefined };
    await saveOfflineQueueItem(queuedItem);
    commitItem(queuedItem);
    setOpen(true);
  }

  async function remove(key: string) {
    const item = itemsRef.current.find((entry) => entry.key === key);
    if (!item || item.status === "downloading") return;
    await deleteOfflineQueueItem(key);
    setItems((current) => {
      const next = current.filter((entry) => entry.key !== key);
      itemsRef.current = next;
      return next;
    });
  }

  const activeCount = items.filter(
    (item) => item.status === "queued" || item.status === "downloading"
  ).length;

  return (
    <DownloadQueueContext.Provider value={{ items, ready, enqueue, retry, remove }}>
      {children}
      {items.length > 0 && (
        <aside className="fixed bottom-4 right-4 z-70 w-[min(24rem,calc(100vw-2rem))]" aria-live="polite">
          <div className="overflow-hidden rounded-lg border border-white/15 bg-zinc-950 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium"
                aria-expanded={open}
              >
                <Download className="size-4 shrink-0 text-primary" />
                <span className="truncate">Download queue</span>
                <span className="text-xs text-zinc-400">{activeCount} active</span>
              </button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpen((value) => !value)}
                aria-label={open ? "Collapse download queue" : "Expand download queue"}
              >
                {open ? <X /> : <Download />}
              </Button>
            </div>
            {open && (
              <ul className="max-h-80 divide-y divide-white/10 overflow-y-auto border-t border-white/10">
                {items.map((item) => (
                  <li key={item.key} className="px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="mt-1 text-xs text-zinc-400">
                          {item.status === "downloading" && `Downloading${item.progress === null ? "…" : ` · ${item.progress}%`}`}
                          {item.status === "queued" && "Queued"}
                          {item.status === "completed" && "Saved offline"}
                          {item.status === "failed" && (item.error || "Download failed")}
                        </p>
                        {item.status === "downloading" && (
                          <div className="mt-2 h-1 overflow-hidden rounded bg-white/10">
                            <div
                              className="h-full bg-primary transition-[width]"
                              style={{ width: `${item.progress ?? 0}%` }}
                            />
                          </div>
                        )}
                      </div>
                      {item.status === "failed" ? (
                        <Button size="icon" variant="ghost" onClick={() => void retry(item.key)} aria-label={`Retry ${item.title}`}>
                          <RotateCcw />
                        </Button>
                      ) : item.status !== "downloading" ? (
                        <Button size="icon" variant="ghost" onClick={() => void remove(item.key)} aria-label={`Remove ${item.title} from queue`}>
                          <Trash2 />
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      )}
    </DownloadQueueContext.Provider>
  );
}
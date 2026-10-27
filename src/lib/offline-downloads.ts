export type OfflineDownloadMeta = {
  key: string;
  title: string;
  detailPath: string;
  type: number | string;
  sea: number;
  eps: number;
  size: number;
  mimeType: string;
  createdAt: number;
  url?: string;
};

export type OfflineQueueStatus = "queued" | "downloading" | "completed" | "failed";

export type OfflineQueueItem = {
  key: string;
  title: string;
  detailPath: string;
  type: number | string;
  sea: number;
  eps: number;
  createdAt: number;
  status: OfflineQueueStatus;
  progress: number | null;
  error?: string;
};

type OfflineDownloadRecord = OfflineDownloadMeta & {
  blob: Blob;
};

const DB_NAME = "watchera-offline";
const STORE_NAME = "downloads";
const QUEUE_STORE_NAME = "download-queue";
const DB_VERSION = 2;

export function getOfflineVideoKey({
  detailPath,
  type,
  sea,
  eps,
}: {
  detailPath: string;
  type: number | string;
  sea: number;
  eps: number;
}) {
  return `${detailPath}|${String(type)}|${sea}|${eps}`;
}

function openOfflineDb(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB is not supported in this browser."));
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error ?? new Error("Failed to open offline database."));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
        store.createIndex("createdAt", "createdAt");
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE_NAME)) {
        db.createObjectStore(QUEUE_STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export async function listOfflineQueue(): Promise<OfflineQueueItem[]> {
  const db = await openOfflineDb();

  return await new Promise((resolve, reject) => {
    const transaction = db.transaction(QUEUE_STORE_NAME, "readonly");
    const request = transaction.objectStore(QUEUE_STORE_NAME).getAll();

    request.onerror = () => reject(request.error ?? new Error("Failed to load download queue."));
    request.onsuccess = () => {
      const items = (request.result as OfflineQueueItem[] | undefined) ?? [];
      resolve(items.sort((a, b) => a.createdAt - b.createdAt));
    };
  });
}

export async function saveOfflineQueueItem(item: OfflineQueueItem): Promise<void> {
  const db = await openOfflineDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(QUEUE_STORE_NAME, "readwrite");
    const request = transaction.objectStore(QUEUE_STORE_NAME).put(item);

    request.onerror = () => reject(request.error ?? new Error("Failed to update download queue."));
    request.onsuccess = () => resolve();
  });
}

export async function deleteOfflineQueueItem(key: string): Promise<void> {
  const db = await openOfflineDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(QUEUE_STORE_NAME, "readwrite");
    const request = transaction.objectStore(QUEUE_STORE_NAME).delete(key);

    request.onerror = () => reject(request.error ?? new Error("Failed to remove queue item."));
    request.onsuccess = () => resolve();
  });
}

export async function saveDownloadedVideo(
  meta: Omit<OfflineDownloadMeta, "size" | "mimeType" | "createdAt" | "url"> & { url?: string },
  blob: Blob
): Promise<OfflineDownloadMeta> {
  const db = await openOfflineDb();
  const record: OfflineDownloadRecord = {
    ...meta,
    key: meta.key,
    size: blob.size,
    mimeType: blob.type || "video/mp4",
    createdAt: Date.now(),
    url: meta.url,
    blob,
  };

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onerror = () => reject(request.error ?? new Error("Failed to save downloaded video."));
    request.onsuccess = () => resolve();
  });

  return {
    ...record,
    size: record.size,
    mimeType: record.mimeType,
    createdAt: record.createdAt,
    url: record.url,
  };
}

export async function getDownloadedVideo(key: string): Promise<OfflineDownloadRecord | null> {
  const db = await openOfflineDb();

  return await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onerror = () => reject(request.error ?? new Error("Failed to load downloaded video."));
    request.onsuccess = () => {
      const result = request.result as OfflineDownloadRecord | undefined;
      resolve(result ?? null);
    };
  });
}

export async function listDownloadedVideos(): Promise<OfflineDownloadMeta[]> {
  const db = await openOfflineDb();

  return await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error ?? new Error("Failed to list downloaded videos."));
    request.onsuccess = () => {
      const items = (request.result as OfflineDownloadRecord[] | undefined) ?? [];
      resolve(
        items.map(({ key, title, detailPath, type, sea, eps, size, mimeType, createdAt, url }) => ({
          key,
          title,
          detailPath,
          type,
          sea,
          eps,
          size,
          mimeType,
          createdAt,
          url,
        }))
      );
    };
  });
}

export async function deleteDownloadedVideo(key: string): Promise<void> {
  const db = await openOfflineDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);

    request.onerror = () => reject(request.error ?? new Error("Failed to delete downloaded video."));
    request.onsuccess = () => resolve();
  });
}

const CACHE_NAME = "watchera-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
];

// URLs that should NOT be cached (video streams, API calls, etc.)
const NO_CACHE_PATTERNS = [
  /\/api\/play/,           // Our play API
  /streaming-proxy/,       // PlexHD streaming proxy
  /\.m3u8/,                // HLS playlists
  /\.mp4/,                 // Direct MP4
  /\/stream\//,            // Any stream path
  /\.ts$/,                 // TS segments
];

function shouldCache(request) {
  if (request.method !== "GET") return false;
  const url = request.url;
  return !NO_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip caching for video streams and API calls
  if (!shouldCache(request)) {
    return; // Let browser handle directly
  }

  // Handle image requests with cache-first strategy
  if (request.destination === "image") {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cached);
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // Handle other requests (pages, scripts, styles) with cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        if (request.destination === "document") {
          return caches.match("/");
        }
      });
    })
  );
});
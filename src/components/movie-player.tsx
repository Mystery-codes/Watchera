"use client";

import { useEffect, useRef, useState } from "react";

const PLEXHD_API_URL = process.env.NEXT_PUBLIC_PLEXHD_API_URL ?? "https://streamapinuxt.hdplexv.workers.dev";
const PLEXHD_STREAM_TOKEN = process.env.NEXT_PUBLIC_PLEXHD_STREAM_TOKEN ?? "";
const PLEXHD_API_KEY = process.env.NEXT_PUBLIC_PLEXHD_API_KEY ?? "";

export function MoviePlayer({
  detailPath,
  type = 1,
  sea = 0,
  eps = 0,
  offlineBlob,
  isSignedIn = false,
  enforceSignInGate = false,
  onSignInRequired,
}: {
  detailPath: string;
  type?: number | string;
  sea?: number;
  eps?: number;
  offlineBlob?: Blob | null;
  isSignedIn?: boolean;
  enforceSignInGate?: boolean;
  onSignInRequired?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const signInPromptedRef = useRef(false);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSeries = Number(type) === 2;
  const season = isSeries ? Number(sea) : 0;
  const episode = isSeries ? Number(eps) : 0;

  useEffect(() => {
    if (offlineBlob) {
      const url = URL.createObjectURL(offlineBlob);
      setVideoSrc(url);
      setLoading(false);
      return () => URL.revokeObjectURL(url);
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchStream() {
      try {
        // Fetch video source directly from PlexHD
        const vidSourceRes = await fetch(
          `${PLEXHD_API_URL}/api/stream/vid-source?detailPath=${encodeURIComponent(detailPath)}&sea=${season}&eps=${episode}`,
          {
            headers: { "X-AUTH-KEY": PLEXHD_API_KEY },
            signal: AbortSignal.timeout(30000),
          }
        );

        if (!vidSourceRes.ok) throw new Error(`Failed to fetch video source: ${vidSourceRes.status}`);

        const data = await vidSourceRes.json();
        const streams: { id: string; quality: number; url: string }[] = (data.stream ?? []).map(
          (s: { id: string; quality: number; url: string }) => ({
            id: s.id,
            quality: s.quality,
            url: s.url,
          })
        );

        if (streams.length === 0) throw new Error("No streams available");

        // Sort by quality descending and pick best
        const best = [...streams].sort((a, b) => b.quality - a.quality)[0];

        if (!PLEXHD_STREAM_TOKEN) throw new Error("Stream token missing");

        // Build PlexHD proxy URL
        const proxyUrl = `${PLEXHD_API_URL}/api/stream/streaming-proxy?url=${encodeURIComponent(best.url)}&token=${encodeURIComponent(PLEXHD_STREAM_TOKEN)}`;

        console.log("Got proxy URL:", proxyUrl);

        // Test the proxy URL first
        const headRes = await fetch(proxyUrl, { method: "HEAD" });
        console.log("Proxy HEAD response:", headRes.status, headRes.headers.get("Content-Type"));

        if (!cancelled) {
          if (headRes.ok && headRes.headers.get("Content-Type")?.startsWith("video/")) {
            setVideoSrc(proxyUrl);
          } else {
            throw new Error(`Proxy returned ${headRes.status} ${headRes.headers.get("Content-Type")}`);
          }
        }
      } catch (err) {
        console.error("Stream fetch error:", err);
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStream();

    return () => {
      cancelled = true;
    };
  }, [detailPath, season, episode, offlineBlob]);

  useEffect(() => {
    signInPromptedRef.current = false;
  }, [detailPath, sea, eps]);

  function requireSignIn(video: HTMLVideoElement) {
    if (!enforceSignInGate || isSignedIn || video.currentTime < 180) return false;
    video.pause();
    if (!signInPromptedRef.current) {
      signInPromptedRef.current = true;
      onSignInRequired?.();
    }
    return true;
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const video = videoRef.current;
      if (!video) return;

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "ArrowUp":
          e.preventDefault();
          video.playbackRate = Math.min(2, (video.playbackRate || 1) + 0.25);
          break;
        case "ArrowDown":
          e.preventDefault();
          video.playbackRate = Math.max(0.25, (video.playbackRate || 1) - 0.25);
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-lg bg-black">
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-black z-10"><div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" /></div>}
      {error && <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 text-red-400 p-4 text-center">{error}</div>}
      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        className="aspect-video w-full bg-black"
        src={videoSrc}
        crossOrigin="anonymous"
        onTimeUpdate={(event) => requireSignIn(event.currentTarget)}
        onPlay={(event) => requireSignIn(event.currentTarget)}
        onSeeking={(event) => {
          const video = event.currentTarget;
          if (requireSignIn(video)) video.currentTime = 180;
        }}
        onError={(e) => {
          const video = e.currentTarget;
          console.error("Video error:", video.error);
          setError(`Playback failed: ${video.error?.message || "Unknown error"}`);
        }}
      />
    </div>
  );
}
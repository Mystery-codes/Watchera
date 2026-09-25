"use client";

import { useEffect, useRef, useState } from "react";

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

  const apiUrl = `/api/play?detailPath=${encodeURIComponent(detailPath)}&type=${encodeURIComponent(type)}&sea=${encodeURIComponent(sea)}&eps=${encodeURIComponent(eps)}`;

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
        console.log("Fetching from /api/play:", apiUrl);
        const res = await fetch(apiUrl);

        console.log("/api/play response:", res.status, res.statusText);

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(`/api/play ${res.status}: ${errText || res.statusText}`);
        }

        const data = await res.json();
        console.log("/api/play data:", data);

        if (!cancelled && data.proxyUrl) {
          console.log("Got proxy URL:", data.proxyUrl);

          // Test the proxy URL first
          const headRes = await fetch(data.proxyUrl, { method: "HEAD" });
          console.log("Proxy HEAD response:", headRes.status, headRes.headers.get("Content-Type"));

          if (!cancelled) {
            if (headRes.ok && headRes.headers.get("Content-Type")?.startsWith("video/")) {
              setVideoSrc(data.proxyUrl);
            } else {
              const errText = await headRes.text().catch(() => "");
              throw new Error(`Proxy ${headRes.status}: ${errText || headRes.headers.get("Content-Type")}`);
            }
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
  }, [apiUrl, offlineBlob]);

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
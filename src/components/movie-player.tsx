"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = useMemo(
    () =>
      `/api/play?detailPath=${encodeURIComponent(
        detailPath
      )}&type=${encodeURIComponent(type)}&sea=${encodeURIComponent(sea)}&eps=${encodeURIComponent(eps)}`,
    [detailPath, type, sea, eps]
  );

  useEffect(() => {
    if (offlineBlob) {
      const url = URL.createObjectURL(offlineBlob);
      setVideoSrc(url);
      setLoading(false);
      return () => URL.revokeObjectURL(url);
    }

    let cancelled = false;
    setLoading(true);

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to get stream URL");
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data.proxyUrl) {
          setVideoSrc(data.proxyUrl);
        }
      })
      .catch((err) => {
        console.error("Stream URL fetch error:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

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
    <div className="overflow-hidden rounded-lg bg-black">
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-black"><div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" /></div>}
      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        className="aspect-video w-full bg-black"
        src={videoSrc ?? ""}
        onTimeUpdate={(event) => requireSignIn(event.currentTarget)}
        onPlay={(event) => requireSignIn(event.currentTarget)}
        onSeeking={(event) => {
          const video = event.currentTarget;
          if (requireSignIn(video)) video.currentTime = 180;
        }}
      />
    </div>
  );
}
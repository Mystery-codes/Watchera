"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function MoviePlayer({
  detailPath,
  type = 1,
  sea = 0,
  eps = 0,
  offlineBlob,
}: {
  detailPath: string;
  type?: number | string;
  sea?: number;
  eps?: number;
  offlineBlob?: Blob | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const src = useMemo(
    () =>
      `/api/play?detailPath=${encodeURIComponent(
        detailPath
      )}&type=${encodeURIComponent(type)}&sea=${encodeURIComponent(sea)}&eps=${encodeURIComponent(eps)}`,
    [detailPath, type, sea, eps]
  );

  useEffect(() => {
    if (!offlineBlob) {
      setVideoSrc(src);
      return;
    }

    const url = URL.createObjectURL(offlineBlob);
    setVideoSrc(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [offlineBlob, src]);

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
      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        className="aspect-video w-full bg-black"
        src={videoSrc ?? src}
      />
    </div>
  );
}

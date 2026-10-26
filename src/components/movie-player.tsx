"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Subtitles } from "lucide-react";
import { cn } from "@/lib/utils";

type Caption = { id: string; lan: string; lanName: string; url: string };

type VttCue = { start: number; end: number; text: string };

function parseVtt(text: string): VttCue[] {
  const lines = text.split(/\r\n|\r|\n/);
  const cues: VttCue[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || line === "WEBVTT" || line.startsWith("NOTE")) {
      i++;
      continue;
    }

    const timestamp = "(?:\\d+:)?\\d{2}:\\d{2}[.,]\\d{3}";
    const timingMatch = line.match(new RegExp(`^(${timestamp})\\s*-->\\s*(${timestamp})`));
    if (!timingMatch) {
      i++;
      continue;
    }

    const start = parseTimestamp(timingMatch[1]);
    const end = parseTimestamp(timingMatch[2]);
    i++;

    const textParts: string[] = [];
    while (i < lines.length) {
      const tLine = lines[i];
      if (tLine.trim() === "") break;
      textParts.push(tLine);
      i++;
    }
    cues.push({ start, end, text: textParts.join(" ") });
  }

  return cues;
}

function parseTimestamp(ts: string): number {
  const parts = ts.replace(",", ".").split(":");
  if (parts.length === 2) {
    return Number(parts[0]) * 60 + Number(parts[1]);
  }
  return Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);
}

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
  const autoSelectedCaptionRef = useRef(false);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [selectedCaptionId, setSelectedCaptionId] = useState<string | null>(null);
  const [cues, setCues] = useState<VttCue[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const apiUrl = `/api/play?detailPath=${encodeURIComponent(detailPath)}&type=${encodeURIComponent(type)}&sea=${encodeURIComponent(sea)}&eps=${encodeURIComponent(eps)}`;

  useEffect(() => {
    if (captions.length > 0 && !autoSelectedCaptionRef.current) {
      autoSelectedCaptionRef.current = true;
      setSelectedCaptionId(captions[0].id);
    }
  }, [captions]);

  useEffect(() => {
    let cancelled = false;
    const active = captions.find((c) => c.id === selectedCaptionId);
    if (!active || selectedCaptionId === null) {
      setCues([]);
      return;
    }

    async function fetchVtt() {
      try {
        const proxyUrl = `/api/play?vtt=1&caption=${encodeURIComponent(active!.url)}&detailPath=${encodeURIComponent(detailPath)}&type=${encodeURIComponent(String(type))}&sea=${encodeURIComponent(String(sea))}&eps=${encodeURIComponent(String(eps))}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`VTT fetch ${res.status}`);
        const text = await res.text();
        if (!cancelled) setCues(parseVtt(text));
      } catch (err) {
        console.error("Subtitle fetch error:", err);
        if (!cancelled) setCues([]);
      }
    }

    fetchVtt();

    return () => {
      cancelled = true;
    };
  }, [selectedCaptionId, captions]);

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

        if (!cancelled && data.streamUrl) {
          if (data.captions) setCaptions(data.captions);
          setVideoSrc(data.streamUrl);
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

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const container = videoRef.current?.closest(".relative");
      if (container && !container.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectCaption = useCallback((id: string | null) => {
    setSelectedCaptionId(id);
    setMenuOpen(false);
  }, []);

  const activeCaption = captions.find((c) => c.id === selectedCaptionId);
  const activeCue = cues.find((c) => currentTime >= c.start && currentTime < c.end);

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
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
          requireSignIn(event.currentTarget);
        }}
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
      {activeCue && selectedCaptionId !== null && (
        <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 z-30 text-white text-sm font-medium drop-shadow-md px-4 py-1.5 rounded-lg bg-black/60 text-center leading-snug whitespace-pre-wrap">
          {activeCue.text}
        </div>
      )}
      {captions.length > 0 && (
        <div className="absolute right-2 top-2 z-20 flex items-center gap-2">
          <div className="relative inline-block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((open) => !open);
              }}
              className="flex h-9 max-w-44 items-center gap-1.5 rounded-md border border-white/10 bg-black/70 px-2.5 text-xs text-white transition hover:bg-black/80"
              aria-label="Subtitles"
              aria-expanded={menuOpen}
              title={activeCaption?.lanName ?? "Subtitles"}
            >
              <Subtitles className="size-4 shrink-0" />
              <span className="min-w-0 truncate">{selectedCaptionId === null ? "Off" : activeCaption?.lanName ?? "CC"}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-zinc-800 bg-black/95 p-1 text-zinc-200 shadow-2xl animate-in fade-in zoom-in duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectCaption(null);
                  }}
                  className="w-full text-left rounded-md px-3 py-2 text-sm transition-colors"
                >
                  {selectedCaptionId === null ? "Off (on)" : "Off"}
                </button>
                {captions.map((c) => (
                  <button
                    key={c.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectCaption(c.id);
                    }}
                    className={cn(
                      "w-full truncate rounded-md px-3 py-2 text-left text-sm transition-colors",
                      selectedCaptionId === c.id
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-300 hover:bg-zinc-900/50"
                    )}
                    title={c.lanName}
                  >
                    {c.lanName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

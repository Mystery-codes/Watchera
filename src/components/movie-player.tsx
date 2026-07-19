"use client";

import { useMemo } from "react";

export function MoviePlayer({ movieId }: { movieId: string | number }) {
  const src = useMemo(() => `/api/play?id=${encodeURIComponent(movieId)}`, [movieId]);

  return (
    <div className="overflow-hidden rounded-lg bg-black">
      <video
        controls
        autoPlay
        playsInline
        className="aspect-video w-full bg-black"
        src={src}
      />
    </div>
  );
}

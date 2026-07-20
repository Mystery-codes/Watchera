"use client";

import { useMemo } from "react";

export function MoviePlayer({ detailPath }: { detailPath: string }) {
  const src = useMemo(
    () => `/api/play?detailPath=${encodeURIComponent(detailPath)}`,
    [detailPath]
  );

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

"use client";

import { useMemo } from "react";

export function MoviePlayer({
  detailPath,
  type = 1,
}: {
  detailPath: string;
  type?: number;
}) {
  const src = useMemo(
    () =>
      `/api/play?detailPath=${encodeURIComponent(
        detailPath
      )}&type=${encodeURIComponent(type)}`,
    [detailPath, type]
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

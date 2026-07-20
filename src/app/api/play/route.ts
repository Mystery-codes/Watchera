import { NextRequest, NextResponse } from "next/server";
import { fetchVidSource } from "@/lib/plexhd";

const API_URL = process.env.PLEXHD_API_URL ?? "https://plexhd-server.pages.dev";
const API_KEY = process.env.PLEXHD_API_KEY ?? "";
const STREAM_TOKEN = process.env.PLEXHD_STREAM_TOKEN ?? "";

export async function GET(request: NextRequest) {
  const detailPath = request.nextUrl.searchParams.get("detailPath");
  if (!detailPath) {
    return NextResponse.json({ error: "Missing detailPath" }, { status: 400 });
  }

  // 1. Resolve the real stream URL via vid-source (uses X-AUTH-KEY).
  const source = await fetchVidSource(detailPath);
  if (!source || source.streams.length === 0) {
    return NextResponse.json(
      { error: "No stream available" },
      { status: 404 }
    );
  }

  // Pick the highest quality stream.
  const best = [...source.streams].sort((a, b) => b.quality - a.quality)[0];

  // 2. Proxy through streaming-proxy (uses ?token=, not the header).
  const upstream = `${API_URL}/api/stream/streaming-proxy?url=${encodeURIComponent(
    best.url
  )}&token=${encodeURIComponent(STREAM_TOKEN)}`;

  try {
    const res = await fetch(upstream, { cache: "no-store" });
    if (!res.ok || !res.body) {
      return NextResponse.json(
        { error: "Upstream stream unavailable", status: res.status },
        { status: res.status || 502 }
      );
    }
    return new NextResponse(res.body, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "video/mp4",
        "Cache-Control": "no-store",
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach stream" },
      { status: 502 }
    );
  }
}

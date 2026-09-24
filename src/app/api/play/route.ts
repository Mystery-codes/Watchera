import { NextRequest, NextResponse } from "next/server";
import { fetchVidSource } from "@/lib/plexhd";

const API_URL = process.env.PLEXHD_API_URL ?? "https://streamapinuxt.hdplexv.workers.dev";
const STREAM_TOKEN = process.env.PLEXHD_STREAM_TOKEN ?? "";

export async function GET(request: NextRequest) {
  const detailPath = request.nextUrl.searchParams.get("detailPath");
  if (!detailPath) {
    return NextResponse.json({ error: "Missing detailPath" }, { status: 400 });
  }
  const type = Number(request.nextUrl.searchParams.get("type") ?? "1");
  const isSeries = type === 2;
  const sea = isSeries ? Number(request.nextUrl.searchParams.get("sea") ?? "1") : 0;
  const eps = isSeries ? Number(request.nextUrl.searchParams.get("eps") ?? "1") : 0;

  const source = await fetchVidSource(detailPath, isSeries, sea, eps);
  if (!source || source.streams.length === 0) {
    return NextResponse.json(
      { error: "No stream available" },
      { status: 404 }
    );
  }

  // Return the best stream URL for client-side proxying
  const best = [...source.streams].sort((a, b) => b.quality - a.quality)[0];
  
  if (!STREAM_TOKEN) {
    return NextResponse.json({ error: "Stream token missing" }, { status: 502 });
  }

  // Return the PlexHD proxy URL for direct browser-to-proxy streaming
  const proxyUrl = `${API_URL}/api/stream/streaming-proxy?url=${encodeURIComponent(
    best.url
  )}&token=${encodeURIComponent(STREAM_TOKEN)}`;

  return NextResponse.json({ proxyUrl, quality: best.quality });
}
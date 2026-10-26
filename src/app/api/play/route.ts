import { NextRequest, NextResponse } from "next/server";
import { fetchVidSource } from "@/lib/plexhd";

const API_URL = process.env.PLEXHD_API_URL ?? "https://streamapinuxt.hdplexv.workers.dev";
const STREAM_TOKEN = process.env.PLEXHD_STREAM_TOKEN ?? "";

export async function GET(request: NextRequest) {
  const detailPath = request.nextUrl.searchParams.get("detailPath");
  if (!detailPath) {
    return NextResponse.json({ error: "Missing detailPath" }, { status: 400 });
  }
  const streamMode = request.nextUrl.searchParams.get("stream") === "1";
  const vttMode = request.nextUrl.searchParams.get("vtt") === "1";
  const captionUrl = request.nextUrl.searchParams.get("caption");
  const type = Number(request.nextUrl.searchParams.get("type") ?? "1");
  const isSeries = type === 2;
  const sea = isSeries ? Number(request.nextUrl.searchParams.get("sea") ?? "1") : 0;
  const eps = isSeries ? Number(request.nextUrl.searchParams.get("eps") ?? "1") : 0;

  console.log("[/api/play] Fetching vid-source for:", detailPath, { isSeries, sea, eps });

  const source = await fetchVidSource(detailPath, isSeries, sea, eps);
  if (vttMode) {
    if (!captionUrl) {
      return NextResponse.json({ error: "Missing caption url" }, { status: 400 });
    }
    if (!source?.captions.some((caption) => caption.url === captionUrl)) {
      return NextResponse.json({ error: "Caption not found" }, { status: 404 });
    }
    try {
      const upstream = await fetch(captionUrl, {
        signal: request.signal,
        cache: "no-store",
      });
      if (!upstream.ok) {
        return NextResponse.json({ error: "Could not fetch caption" }, { status: upstream.status });
      }
      const text = await upstream.text();
      return new Response(text, {
        status: 200,
        headers: {
          "Content-Type": "text/vtt; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("[/api/play] Caption proxy failed:", error);
      return NextResponse.json({ error: "Could not fetch caption" }, { status: 502 });
    }
  }

  if (!source || source.streams.length === 0) {
    console.log("[/api/play] No streams found");
    return NextResponse.json(
      { error: "No stream available" },
      { status: 404 }
    );
  }

  const best = [...source.streams].sort((a, b) => b.quality - a.quality)[0];
  console.log("[/api/play] Best stream:", best.quality, best.url.substring(0, 80) + "...");

  if (!STREAM_TOKEN) {
    console.error("[/api/play] Stream token missing");
    return NextResponse.json({ error: "Stream token missing" }, { status: 502 });
  }

  const upstreamUrl = `${API_URL}/api/stream/streaming-proxy?url=${encodeURIComponent(
    best.url
  )}&token=${encodeURIComponent(STREAM_TOKEN)}`;

  if (streamMode) {
    try {
      const range = request.headers.get("range");
      const upstream = await fetch(upstreamUrl, {
        headers: range ? { Range: range } : undefined,
        signal: request.signal,
        cache: "no-store",
      });
      const headers = new Headers();
      for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "last-modified", "etag"]) {
        const value = upstream.headers.get(name);
        if (value) headers.set(name, value);
      }
      headers.set("Cache-Control", "no-store");
      headers.set("X-Content-Type-Options", "nosniff");
      return new Response(upstream.body, { status: upstream.status, headers });
    } catch (error) {
      console.error("[/api/play] Stream proxy failed:", error);
      return NextResponse.json({ error: "Could not open video stream" }, { status: 502 });
    }
  }

  const streamUrl = `${request.nextUrl.pathname}?detailPath=${encodeURIComponent(detailPath)}&type=${encodeURIComponent(String(type))}&sea=${encodeURIComponent(String(sea))}&eps=${encodeURIComponent(String(eps))}&stream=1`;
  return NextResponse.json({ streamUrl, quality: best.quality, captions: source.captions });
}

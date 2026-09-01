import { NextRequest, NextResponse } from "next/server";
import { fetchVidSource } from "@/lib/plexhd";

const API_URL = process.env.PLEXHD_API_URL ?? "https://streamapinuxt.hdplexv.workers.dev";
const STREAM_TOKEN = process.env.PLEXHD_STREAM_TOKEN ?? "";

function isPrivateIp(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  let host = value.trim();
  if (host.startsWith("http://") || host.startsWith("https://")) {
    try {
      host = new URL(host).hostname;
    } catch {
      return false;
    }
  }
  const segments = host.split(".").map(Number);
  if (segments.length !== 4 || segments.some((s) => Number.isNaN(s))) return false;
  const [a, b] = segments;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

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

  const best = [...source.streams].sort((a, b) => b.quality - a.quality)[0];

  if (!STREAM_TOKEN) {
    return NextResponse.json({ error: "Stream token missing" }, { status: 502 });
  }

  const upstream = `${API_URL}/api/stream/streaming-proxy?url=${encodeURIComponent(
    best.url
  )}&token=${encodeURIComponent(STREAM_TOKEN)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(upstream, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok && res.body) {
      return new NextResponse(res.body, {
        status: 200,
        headers: {
          "Content-Type": res.headers.get("Content-Type") ?? "video/mp4",
          "Content-Length": res.headers.get("Content-Length") ?? "",
          "Cache-Control": "no-store",
          "Accept-Ranges": "bytes",
        },
      });
    }

  console.error("Stream proxy responded with status:", res.status, "for", detailPath, "streamUrl:", best.url, "isPrivate:", isPrivateIp(best.url));
  if (isPrivateIp(best.url)) {
    return NextResponse.json(
      { error: "Stream source is unavailable. Please try again later." },
      { status: 503 }
    );
  }

  return NextResponse.redirect(best.url, 302);
  } catch (err) {
    console.error("Streaming error for", detailPath, "streamUrl:", best.url, "isPrivate:", isPrivateIp(best.url), err);
    if (isPrivateIp(best.url)) {
      return NextResponse.json(
        { error: "Stream source is unavailable. Please try again later." },
        { status: 503 }
      );
    }
    return NextResponse.redirect(best.url, 302);
  }
}

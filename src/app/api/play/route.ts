import { NextRequest, NextResponse } from "next/server";
import { fetchVidSource } from "@/lib/plexhd";

const API_URL = process.env.PLEXHD_API_URL ?? "https://streamapinuxt.hdplexv.workers.dev";
const STREAM_TOKEN = process.env.PLEXHD_STREAM_TOKEN ?? "";

function mediaTypeForUrl(url: string): string | null {
  const pathname = new URL(url).pathname.toLowerCase();
  if (/\.m3u8$/.test(pathname)) return "application/vnd.apple.mpegurl";
  if (/\.(mp4|m4v)$/.test(pathname)) return "video/mp4";
  if (/\.webm$/.test(pathname)) return "video/webm";
  if (/\.ogv$/.test(pathname)) return "video/ogg";
  if (/\.mov$/.test(pathname)) return "video/quicktime";
  if (/\.ts$/.test(pathname)) return "video/mp2t";
  return null;
}

function sniffMediaType(bytes: Uint8Array): string | null {
  if (bytes.length >= 8 && String.fromCharCode(...bytes.subarray(4, 8)) === "ftyp") return "video/mp4";
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return "video/webm";
  if (bytes.length >= 1 && bytes[0] === 0x47) return "video/mp2t";
  return null;
}

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

  if (!source) {
    return NextResponse.json(
      { error: "Could not retrieve video sources from the provider" },
      { status: 502 }
    );
  }

  if (source.streams.length === 0) {
    console.log("[/api/play] Provider returned no playable streams");
    return NextResponse.json(
      { error: "No playable streams are available for this title or episode" },
      { status: 404 }
    );
  }

  const directUrls = [...source.streams]
    .sort((a, b) => b.quality - a.quality)
    .map((stream) => stream.url)
    .filter((url, index, urls) => Boolean(url) && urls.indexOf(url) === index);

  if (directUrls.length === 0) {
    return NextResponse.json({ error: "No playable stream URL was returned" }, { status: 404 });
  }

  const bestUrl = directUrls[0];
  const best = [...source.streams].sort((a, b) => b.quality - a.quality).find((stream) => stream.url === bestUrl) ?? source.streams[0];
  console.log("[/api/play] Best stream:", best.quality, best.url.substring(0, 80) + "...");

  if (streamMode) {
    if (!STREAM_TOKEN) {
      console.error("[/api/play] PLEXHD_STREAM_TOKEN is missing");
      return NextResponse.json({ error: "Stream proxy token is not configured" }, { status: 502 });
    }

    const requestedUrl = request.nextUrl.searchParams.get("url");
    const streamUrls = requestedUrl
      ? directUrls.filter((url) => url === requestedUrl)
      : directUrls;

    if (requestedUrl && streamUrls.length === 0) {
      return NextResponse.json({ error: "Stream URL is not available for this title" }, { status: 403 });
    }

    for (const url of streamUrls) {
      const host = new URL(url).host;
      try {
        const range = request.headers.get("range");
        const proxyUrl = new URL("/api/stream/streaming-proxy", API_URL);
        proxyUrl.searchParams.set("url", url);
        proxyUrl.searchParams.set("token", STREAM_TOKEN);
        const upstream = await fetch(proxyUrl, {
          headers: range ? { Range: range } : undefined,
          signal: request.signal,
          cache: "no-store",
          redirect: "follow",
        });
        const upstreamType = upstream.headers.get("content-type")?.toLowerCase() ?? "";
        const inferredType = mediaTypeForUrl(url);
        if (!upstream.ok && upstream.status !== 206) {
          console.warn("[/api/play] Upstream stream rejected", {
            host,
            status: upstream.status,
            contentType: upstreamType,
          });
          await upstream.body?.cancel();
          continue;
        }
        if (
          upstreamType.startsWith("text/") ||
          upstreamType.includes("application/json") ||
          upstreamType.includes("application/xml") ||
          upstreamType.includes("text/xml")
        ) {
          console.warn("[/api/play] Upstream returned a non-media response", { host, contentType: upstreamType });
          await upstream.body?.cancel();
          continue;
        }

        let body = upstream.body;
        let sniffedType: string | null = null;
        if (body && (!upstreamType || upstreamType.includes("application/octet-stream"))) {
          const reader = body.getReader();
          const first = await reader.read();
          if (!first.done && first.value) {
            sniffedType = sniffMediaType(first.value);
            let pendingFirstChunk = true;
            body = new ReadableStream({
              async pull(controller) {
                if (pendingFirstChunk) {
                  pendingFirstChunk = false;
                  controller.enqueue(Uint8Array.from(first.value!));
                  return;
                }
                const next = await reader.read();
                if (next.done) controller.close();
                else controller.enqueue(Uint8Array.from(next.value));
              },
              cancel(reason) {
                return reader.cancel(reason);
              },
            });
          } else {
            body = null;
          }
        }

        const headers = new Headers();
        for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "last-modified", "etag"]) {
          const value = upstream.headers.get(name);
          if (value) headers.set(name, value);
        }
        const responseType = upstreamType.includes("application/octet-stream")
          ? inferredType ?? sniffedType ?? "application/octet-stream"
          : upstream.headers.get("content-type") ?? inferredType ?? sniffedType;
        if (responseType) headers.set("Content-Type", responseType);
        console.log("[/api/play] Provider proxy returned media response", {
          host,
          status: upstream.status,
          contentType: responseType ?? "missing",
          range: Boolean(range),
        });
        headers.set("Cache-Control", "no-store");
        headers.set("X-Content-Type-Options", "nosniff");
        return new Response(body, { status: upstream.status, headers });
      } catch (error) {
        console.error("[/api/play] Direct stream proxy failed", { host, error });
      }
    }

    return NextResponse.json({ error: "Could not open video stream" }, { status: 502 });
  }

  const streamParams = new URLSearchParams({
    detailPath,
    type: String(type),
    sea: String(sea),
    eps: String(eps),
    stream: "1",
  });
  const streamUrl = `${request.nextUrl.pathname}?${streamParams.toString()}`;

  return NextResponse.json({
    directUrl: directUrls[0],
    directUrls,
    streamUrl,
    quality: best.quality,
    captions: source.captions,
  });
}

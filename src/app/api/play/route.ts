import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.PLEXHD_API_URL ?? "https://plexhd-server.pages.dev";
const API_KEY = process.env.PLEXHD_API_KEY ?? "";
const STREAM_TOKEN = process.env.PLEXHD_STREAM_TOKEN ?? "";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  if (!STREAM_TOKEN) {
    return NextResponse.json(
      { error: "Stream token not configured" },
      { status: 503 }
    );
  }

  const upstream = `${API_URL}/api/stream/streaming-proxy?id=${encodeURIComponent(
    id
  )}&token=${encodeURIComponent(STREAM_TOKEN)}`;

  try {
    const res = await fetch(upstream, {
      headers: { "X-AUTH-KEY": API_KEY },
      cache: "no-store",
    });

    if (!res.ok || !res.body) {
      return NextResponse.json(
        { error: "Upstream stream unavailable", status: res.status },
        { status: res.status || 502 }
      );
    }

    return new NextResponse(res.body, {
      status: 200,
      headers: {
        "Content-Type":
          res.headers.get("Content-Type") ?? "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach stream" },
      { status: 502 }
    );
  }
}

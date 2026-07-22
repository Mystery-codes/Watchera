import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.PLEXHD_API_URL ?? "https://plexhd-server.pages.dev";
const API_KEY = process.env.PLEXHD_API_KEY ?? "";

export async function GET(request: NextRequest) {
  const detailPath = request.nextUrl.searchParams.get("detailPath");
  if (!detailPath) {
    return NextResponse.json({ error: "Missing detailPath" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${API_URL}/api/stream/movie-details?id=${encodeURIComponent(detailPath)}`,
      {
        headers: { "X-AUTH-KEY": API_KEY },
        next: { revalidate: 600 },
      }
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch details" }, { status: res.status });
    }
    const data = await res.json();
    const subject = data.subject;
    if (!subject) {
      return NextResponse.json({ error: "No subject" }, { status: 404 });
    }

    const seasons: { season: number; episodes: number }[] = [];
    const rawSeasons = subject.seasons ?? subject.seasonList ?? [];

    if (Array.isArray(rawSeasons) && rawSeasons.length > 0) {
      for (const s of rawSeasons) {
        const seasonNumber = Number(s.season ?? s.seasonNumber ?? s.index ?? 1);
        const episodeCount = Number(s.episodes ?? s.episodeCount ?? s.count ?? 1);
        if (seasonNumber > 0) {
          seasons.push({ season: seasonNumber, episodes: Math.max(1, episodeCount) });
        }
      }
    }

    if (seasons.length === 0) {
      const totalEps = Number(subject.episodes ?? subject.episodeCount ?? 1);
      seasons.push({ season: 1, episodes: Math.max(1, totalEps) });
    }

    seasons.sort((a, b) => a.season - b.season);

    return NextResponse.json({ seasons, subjectType: subject.subjectType });
  } catch {
    return NextResponse.json({ error: "Failed to reach upstream" }, { status: 502 });
  }
}

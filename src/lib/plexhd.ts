import "server-only";

import type { Movie } from "./movies";

const API_URL = process.env.PLEXHD_API_URL ?? "https://plexhd-server.pages.dev";
const API_KEY = process.env.PLEXHD_API_KEY ?? "";

export const RANKING_IDS = {
  trending: "1232643093049001320",
  popularMovies: "997144265920760504",
  popularSeries: "1232643093049001320",
  anime: "62133389738001440",
  animation: "7132534597631837112",
  actionMovies: "6050680843129996568",
  horrorMovies: "8614980535946986176",
  fantasy: "6081207125081048720",
  marvel: "5938715630600946768",
  dc: "8981852519202701864",
  kDrama: "4380734070238626200",
  adventure: "7486582804437256712",
  topBox: "8049887023940913872",
  disney: "4893929859782771488",
  tmdbTop250: "6831003342882626360",
  dreamworks: "6498477964521783328",
  pixar: "8300357620121175440",
  shortTv: "7844144696607102784",
  saDrama: "4307848214843217008",
  thaiSeries: "1164329479448281992",
  cDrama: "173752404280836544",
  turkishDrama: "9193088611682599936",
  yorubaMovies: "5618472934214884040",
  nollywood: "8216283712045280",
  teenRomance: "9139789616411735224",
  blackExcellence: "8505361996374835640",
  gangstar: "5475136475249497544",
} as const;

type RankingItem = {
  subjectId: string;
  type: number;
  title: string;
  imdbRatingValue?: string;
  imageUrl?: string;
  releaseDate?: string;
  genre?: string;
  duration?: number;
  detailPath?: string;
};

function mapItem(item: RankingItem, index: number): Movie {
  const year = item.releaseDate ? Number(item.releaseDate.slice(0, 4)) : 0;
  const genres = item.genre
    ? item.genre.split(",").map((g) => g.trim()).filter(Boolean)
    : [];

  return {
    id: Number(item.subjectId.slice(0, 12)) || index + 1,
    title: item.title,
    year,
    rating: year >= 2024 ? "TV-MA" : "PG-13",
    duration: item.duration ? `${Math.floor(item.duration / 60)}h ${item.duration % 60}m` : "—",
    genres: genres.length ? genres : ["Drama"],
    description: "",
    poster: item.imageUrl ?? "https://picsum.photos/seed/cineverse/400/600",
    banner: item.imageUrl ?? "https://picsum.photos/seed/cineverse/1600/900",
    detailPath: item.detailPath ?? item.subjectId,
    subjectType: item.type,
  };
}

export async function fetchRanking(
  id: string,
  limit = 12
): Promise<Movie[]> {
  try {
    const res = await fetch(`${API_URL}/api/stream/ranking-list?id=${id}`, {
      headers: { "X-AUTH-KEY": API_KEY },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items: RankingItem[] = data.response ?? [];
    return items.slice(0, limit).map(mapItem);
  } catch {
    return [];
  }
}

export async function fetchMovieDetails(
  idOrPath: string
): Promise<{ movie: Movie; source: string } | null> {
  try {
    const res = await fetch(`${API_URL}/api/stream/movie-details?id=${idOrPath}`, {
      headers: { "X-AUTH-KEY": API_KEY },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const subject = data.subject;
    if (!subject) return null;

    const genres = subject.genre
      ? String(subject.genre).split(",").map((g: string) => g.trim()).filter(Boolean)
      : [];
    const year = subject.releaseDate ? Number(String(subject.releaseDate).slice(0, 4)) : 0;

    const movie: Movie = {
      id: Number(String(subject.subjectId).slice(0, 12)) || 1,
      title: subject.title,
      year,
      rating: year >= 2024 ? "TV-MA" : "PG-13",
      duration: subject.duration ? `${Math.floor(subject.duration / 60)}h ${subject.duration % 60}m` : "—",
      genres: genres.length ? genres : ["Drama"],
      description: subject.description ?? "",
      poster: subject.cover?.url ?? "https://picsum.photos/seed/cineverse/400/600",
      banner: subject.cover?.url ?? "https://picsum.photos/seed/cineverse/1600/900",
      detailPath: subject.detailPath ?? subject.subjectId,
      subjectType: subject.subjectType,
    };

    return { movie, source: data.resource?.source ?? "" };
  } catch {
    return null;
  }
}

export type StreamSource = {
  id: string;
  quality: number;
  url: string;
};

export type VideoSource = {
  streams: StreamSource[];
  captions: { id: string; lan: string; lanName: string; url: string }[];
};

export async function fetchVidSource(
  detailPath: string,
  isSeries = false,
  sea = 0,
  eps = 0
): Promise<VideoSource | null> {
  const season = isSeries ? sea : 0;
  const episode = isSeries ? eps : 0;
  try {
    const res = await fetch(
      `${API_URL}/api/stream/vid-source?detailPath=${encodeURIComponent(
        detailPath
      )}&sea=${season}&eps=${episode}`,
      {
        headers: { "X-AUTH-KEY": API_KEY },
        next: { revalidate: 600 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const streams: StreamSource[] = (data.stream ?? []).map(
      (s: { id: string; quality: number; url: string }) => ({
        id: s.id,
        quality: s.quality,
        url: s.url,
      })
    );
    const captions = (data.caption ?? []).map(
      (c: { id: string; lan: string; lanName: string; url: string }) => ({
        id: c.id,
        lan: c.lan,
        lanName: c.lanName,
        url: c.url,
      })
    );
    return { streams, captions };
  } catch {
    return null;
  }
}

import type { Movie } from "@/lib/movies";

const STORAGE_KEY = "watchera-my-list";

function getMovieKey(movie: Movie): string {
  return movie.subjectId ?? movie.detailPath ?? String(movie.id);
}

export function readMyList(): Movie[] {
  if (typeof window === "undefined") return [];

  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value as Movie[] : [];
  } catch {
    return [];
  }
}

export function isMovieInMyList(movie: Movie): boolean {
  const key = getMovieKey(movie);
  return readMyList().some((item) => getMovieKey(item) === key);
}

export function toggleMovieInMyList(movie: Movie): boolean {
  const list = readMyList();
  const key = getMovieKey(movie);
  const exists = list.some((item) => getMovieKey(item) === key);
  const next = exists
    ? list.filter((item) => getMovieKey(item) !== key)
    : [...list, movie];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("watchera:my-list-changed"));
  return !exists;
}

export function removeMovieFromMyList(movie: Movie): void {
  const key = getMovieKey(movie);
  const next = readMyList().filter((item) => getMovieKey(item) !== key);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("watchera:my-list-changed"));
}
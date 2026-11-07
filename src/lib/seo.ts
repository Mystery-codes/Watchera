import type { Movie } from "@/lib/movies";

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getTitlePath(movie: Pick<Movie, "id" | "title" | "subjectId" | "detailPath">): string {
  const id = movie.subjectId ?? movie.detailPath ?? String(movie.id);
  return `/title/${encodeURIComponent(id)}/${slugify(movie.title)}`;
}
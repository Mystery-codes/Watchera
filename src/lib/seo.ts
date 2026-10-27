import type { Movie } from "@/lib/movies";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "title";
}

export function createItemRoute(
  movie: Partial<Pick<Movie, "title" | "subjectType" | "subjectId" | "id">>,
  typeOverride?: "movie" | "series"
): string {
  const type = typeOverride ?? (movie.subjectType === 2 ? "series" : "movie");
  const id = movie.subjectId ?? String(movie.id ?? "title");
  const title = movie.title || "title";
  const slug = slugify(title);
  return `/${type}/${slug}/${encodeURIComponent(id)}`;
}

export function getSeoDescription(
  movie: Partial<Pick<Movie, "title" | "genres" | "description" | "year" | "subjectType">>,
  fallbackType?: "movie" | "series"
): string {
  const title = movie.title || "Title";
  const type = fallbackType ?? (movie.subjectType === 2 ? "series" : "movie");
  const genreText = movie.genres?.length ? movie.genres.slice(0, 3).join(", ") : "popular entertainment";
  const text = movie.description?.trim();

  if (text) {
    return `${title} (${movie.year || "New"}) ${type} featuring ${genreText}. ${text.slice(0, 180)}`;
  }

  return `Watch ${title} online on Watchera. Browse ${title} ${type} details, genres, and ratings.`;
}

export function buildMediaSchema(
  movie: Partial<Pick<Movie, "title" | "genres" | "description" | "year" | "poster" | "rating" | "banner" | "subjectType">>,
  typeOverride?: "movie" | "series"
): Record<string, unknown> {
  const type = typeOverride ?? (movie.subjectType === 2 ? "series" : "movie");
  const year = movie.year && movie.year > 0 ? movie.year : undefined;
  const datePublished = year ? `${year}-01-01` : undefined;
  const title = movie.title || "Watchera title";

  return {
    "@context": "https://schema.org",
    "@type": type === "series" ? "TVSeries" : "Movie",
    name: title,
    image: movie.poster || movie.banner || undefined,
    description: movie.description || `${title} on Watchera`,
    genre: movie.genres?.length ? movie.genres : ["Drama"],
    contentRating: movie.rating || undefined,
    datePublished,
    keywords: movie.genres?.length ? movie.genres.join(", ") : "movies, series, streaming",
  };
}

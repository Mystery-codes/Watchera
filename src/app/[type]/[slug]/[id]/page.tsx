import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { StructuredData } from "@/components/structured-data";
import { Button } from "@/components/ui/button";
import { fetchMovieDetails } from "@/lib/plexhd";
import { buildMediaSchema, createItemRoute, getSeoDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; slug: string; id: string }>;
}): Promise<Metadata> {
  const { type, id } = await params;
  const mediaType = type === "series" ? "series" : "movie";
  const movieDetails = await fetchMovieDetails(decodeURIComponent(id));

  if (!movieDetails) {
    return {
      title: "Title not found | Watchera",
      description: "The requested title could not be found.",
    };
  }

  const { movie } = movieDetails;
  const canonical = createItemRoute(movie, mediaType);

  return {
    title: `${movie.title} | Watchera`,
    description: getSeoDescription(movie, mediaType),
    alternates: { canonical },
    openGraph: {
      title: `${movie.title} | Watchera`,
      description: getSeoDescription(movie, mediaType),
      type: "website",
      images: [{ url: movie.poster || movie.banner, width: 1200, height: 630, alt: movie.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${movie.title} | Watchera`,
      description: getSeoDescription(movie, mediaType),
      images: [movie.poster || movie.banner],
    },
  };
}

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ type: string; slug: string; id: string }>;
}) {
  const { type, id } = await params;
  const mediaType = type === "series" ? "series" : "movie";
  const movieDetails = await fetchMovieDetails(decodeURIComponent(id));

  if (!movieDetails) {
    notFound();
  }

  const { movie } = movieDetails;
  const schema = buildMediaSchema(movie, mediaType);

  return (
    <main className="min-h-full bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-8">
        <StructuredData data={schema} />

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">← Back to home</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={mediaType === "series" ? "/popular-series" : "/"}>Browse more titles</Link>
          </Button>
        </div>

        <article className="overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl">
          <div className="relative">
            <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-96">
              <Image
                src={movie.banner || movie.poster}
                alt={movie.title}
                fill
                priority
                sizes="1200px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[260px_1fr] lg:p-10">
            <div className="relative mx-auto h-[360px] w-full max-w-[260px] overflow-hidden rounded-xl border border-white/10 shadow-lg lg:mx-0">
              <Image
                src={movie.poster || movie.banner}
                alt={movie.title}
                fill
                sizes="260px"
                className="object-cover"
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                  {mediaType === "series" ? "Series" : "Movie"}
                </p>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                  {movie.year ? <span>{movie.year}</span> : null}
                  {movie.rating ? <span className="rounded border border-white/10 px-2 py-1">{movie.rating}</span> : null}
                  {movie.duration ? <span>{movie.duration}</span> : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <p className="max-w-2xl text-base leading-7 text-zinc-300">
                {movie.description || `Discover ${movie.title} on Watchera and explore trending titles, genres, and streaming details.`}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <Link href="/">Watch now</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={createItemRoute(movie, mediaType)}>Open in catalog</Link>
                </Button>
              </div>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </main>
  );
}

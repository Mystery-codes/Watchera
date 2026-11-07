import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { fetchMovieDetails } from "@/lib/plexhd";
import { getTitlePath } from "@/lib/seo";
import { TitlePageActions } from "./title-page-actions";

type TitlePageProps = {
  params: Promise<{ id: string; slug: string }>;
};

async function getTitle(id: string) {
  const result = await fetchMovieDetails(id);
  return result?.movie ?? null;
}

export async function generateMetadata({ params }: TitlePageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getTitle(id);

  if (!movie) {
    return { title: "Title not found", robots: { index: false, follow: true } };
  }

  const description = movie.description || `Discover ${movie.title}${movie.year ? ` (${movie.year})` : ""} on Watchera.`;

  return {
    title: movie.year ? `${movie.title} (${movie.year})` : movie.title,
    description,
    alternates: { canonical: getTitlePath(movie) },
    openGraph: {
      type: "website",
      title: movie.title,
      description,
      images: movie.poster ? [movie.poster] : undefined,
    },
  };
}

export default async function TitlePage({ params }: TitlePageProps) {
  const { id } = await params;
  const movie = await getTitle(id);
  if (!movie) notFound();

  return (
    <main className="min-h-full bg-background">
      <Navbar />
      <article className="mx-auto grid max-w-5xl gap-8 px-4 py-28 sm:grid-cols-[240px_1fr] sm:px-8">
        <Image
          src={movie.poster}
          alt={`${movie.title} poster`}
          width={400}
          height={600}
          className="w-full max-w-60 rounded-md object-cover"
          priority
        />
        <div className="space-y-5">
          <div>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Watchera home
            </Link>
            <h1 className="mt-3 text-3xl font-bold">{movie.title}</h1>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {movie.year > 0 && <span>{movie.year}</span>}
            {movie.duration !== "—" && <span>{movie.duration}</span>}
            {movie.genres.map((genre) => <span key={genre}>{genre}</span>)}
          </div>
          {movie.description && <p className="max-w-2xl leading-7">{movie.description}</p>}
          <TitlePageActions movie={movie} />
        </div>
      </article>
      <Footer />
    </main>
  );
}
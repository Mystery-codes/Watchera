import type { Metadata } from "next";
import Link from "next/link";
import { SiteInfoPage } from "@/components/site-info-page";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Watchera",
  description: "Learn about Watchera, its movie and TV discovery experience, and founder Divine Ifediorah.",
  alternates: { canonical: "/about" },
  openGraph: { url: `${siteUrl}/about`, title: "About Watchera", description: "Learn about Watchera, its movie and TV discovery experience, and founder Divine Ifediorah." },
};

export default function AboutPage() {
  return (
    <SiteInfoPage
      title="About Watchera"
      intro="Watchera is a movie and television discovery experience founded by Divine Ifediorah. It helps viewers browse popular movies, series, and animation."
      sections={[
        { title: "Founder", content: <><Link className="text-foreground underline" href="/founder/divine-ifediorah">Divine Ifediorah</Link> is the founder of Watchera.</> },
        { title: "Discover something to watch", content: "Explore collections by category, search for titles, and open a title page for more information." },
        { title: "Your Watchera list", content: "Save titles to My List on this browser. The list is stored on your device and is not synced between devices." },
      ]}
    />
  );
}

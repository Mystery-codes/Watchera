import type { Metadata } from "next";
import { SiteInfoPage } from "@/components/site-info-page";

export const metadata: Metadata = {
  title: "About Watchera",
  description: "Learn about Watchera, a place to discover movies, series, and animation.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <SiteInfoPage
      title="About Watchera"
      intro="Watchera is a movie and television discovery experience for browsing popular movies, series, and animation."
      sections={[
        { title: "Discover something to watch", content: "Explore collections by category, search for titles, and open a title page for more information." },
        { title: "Your Watchera list", content: "Save titles to My List on this browser. The list is stored on your device and is not synced between devices." },
      ]}
    />
  );
}
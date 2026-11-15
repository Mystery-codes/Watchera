import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Popular Series",
  description: "Explore popular TV series on Watchera.",
  alternates: { canonical: "/popular-series" },
  openGraph: { url: `${siteUrl}/popular-series`, title: "Popular Series", description: "Explore popular TV series on Watchera." },
};

export default function PopularSeriesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

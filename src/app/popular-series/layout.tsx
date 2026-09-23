import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Popular Series",
  description: "Explore popular TV series on Watchera.",
  alternates: { canonical: "/popular-series" },
};

export default function PopularSeriesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

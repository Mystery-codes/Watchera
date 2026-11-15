import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Animation",
  description: "Browse animated movies and shows on Watchera.",
  alternates: { canonical: "/animation" },
  openGraph: { url: `${siteUrl}/animation`, title: "Animation", description: "Browse animated movies and shows on Watchera." },
};

export default function AnimationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

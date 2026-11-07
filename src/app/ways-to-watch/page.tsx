import type { Metadata } from "next";
import Link from "next/link";
import { SiteInfoPage } from "@/components/site-info-page";

export const metadata: Metadata = {
  title: "Ways to Watch",
  description: "Use Watchera in a supported web browser.",
  alternates: { canonical: "/ways-to-watch" },
};

export default function WaysToWatchPage() {
  return (
    <SiteInfoPage
      title="Ways to Watch"
      intro="Watchera is available on the web at watchera.net. Use a current browser with JavaScript enabled."
      sections={[
        { title: "Installable app", content: "On supported browsers and devices, you may be able to install Watchera from the browser's install option." },
        { title: "Downloads", content: <>Sign in to use available download features. Visit <Link className="text-foreground underline" href="/downloads">Downloads</Link> to see saved items on this device.</> },
      ]}
    />
  );
}
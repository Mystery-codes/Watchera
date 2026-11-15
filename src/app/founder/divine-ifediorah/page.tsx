import type { Metadata } from "next";
import Link from "next/link";
import { SiteInfoPage } from "@/components/site-info-page";
import { siteUrl } from "@/lib/seo";

const founderId = `${siteUrl}/founder/divine-ifediorah#person`;

export const metadata: Metadata = {
  title: "Divine Ifediorah, Founder of Watchera",
  description: "Divine Ifediorah is the founder of Watchera, a movie and television discovery platform.",
  alternates: { canonical: "/founder/divine-ifediorah" },
  openGraph: {
    url: `${siteUrl}/founder/divine-ifediorah`,
    title: "Divine Ifediorah, Founder of Watchera",
    description: "Divine Ifediorah is the founder of Watchera, a movie and television discovery platform.",
  },
};

export default function FounderPage() {
  const profileStructuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      "@id": founderId,
      name: "Divine Ifediorah",
      jobTitle: "Founder of Watchera",
      url: `${siteUrl}/founder/divine-ifediorah`,
      founderOf: { "@id": `${siteUrl}/#organization` },
    },
  };

  return (
    <>
      <SiteInfoPage
        title="Divine Ifediorah, Founder of Watchera"
        intro="Divine Ifediorah is the founder of Watchera, a movie and television discovery platform for browsing movies, series, and animation."
        sections={[
          {
            title: "About Watchera",
            content: <>Watchera helps viewers explore popular movies, TV series, and animation. Visit <Link className="text-foreground underline" href="/">Watchera</Link> to browse titles or read more <Link className="text-foreground underline" href="/about">about the platform</Link>.</>,
          },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileStructuredData).replace(/</g, "\\u003c") }}
      />
    </>
  );
}

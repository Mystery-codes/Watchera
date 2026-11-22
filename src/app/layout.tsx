import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AOSProvider } from "@/components/aos-provider";
import { DownloadQueueProvider } from "@/components/download-queue-provider";
import { siteUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ownerName = "Divine Ifediorah";
const siteTitle = "Watchera | Discover Movies, TV Shows & Anime";
const siteDescription = "Explore popular movies, TV series, anime, Nollywood films, and K-dramas. Find your next watch with Watchera.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Watchera",
  },
  description: siteDescription,
  applicationName: "Watchera",
  authors: [{ name: ownerName }],
  creator: ownerName,
  publisher: ownerName,
  keywords: ["Watchera", "movies", "TV shows", "series", "animation", "Nollywood", "K-drama"],
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Watchera",
    title: siteTitle,
    description: siteDescription,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Watchera" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Watchera",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: "device-width",
  height: "device-height",
  themeColor: "#e50914",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Watchera",
        url: siteUrl,
        description: "A movie and television discovery platform for browsing movies, series, and animation.",
        logo: `${siteUrl}/logo.png`,
        founder: { "@id": `${siteUrl}/founder/divine-ifediorah#person` },
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/founder/divine-ifediorah#person`,
        name: ownerName,
        jobTitle: "Founder of Watchera",
        founderOf: { "@id": `${siteUrl}/#organization` },
        url: `${siteUrl}/founder/divine-ifediorah`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "Watchera",
        url: siteUrl,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <AOSProvider />
        <DownloadQueueProvider>{children}</DownloadQueueProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                window.addEventListener("load", () => {
                  navigator.serviceWorker.register("/sw.js").catch(() => {});
                });
              }
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AOSProvider } from "@/components/aos-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Watchera | Movies and TV Shows",
    template: "%s | Watchera",
  },
  description: "Discover movies, series, animation, and more on Watchera.",
  applicationName: "Watchera",
  keywords: ["movies", "TV shows", "series", "animation", "Nollywood", "K-drama"],
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
    title: "Watchera | Movies and TV Shows",
    description: "Discover movies, series, animation, and more on Watchera.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Watchera" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Watchera | Movies and TV Shows",
    description: "Discover movies, series, animation, and more on Watchera.",
    images: ["/opengraph-image"],
  },
  manifest: "/manifest.json",
  themeColor: "#e50914",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <AOSProvider />
        {children}
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
      </body>
    </html>
  );
}

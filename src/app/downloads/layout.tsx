import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Your videos saved for offline viewing in Watchera.",
  robots: { index: false, follow: false },
};

export default function DownloadsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

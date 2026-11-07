import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My List",
  robots: { index: false, follow: true },
};

export default function MyListLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
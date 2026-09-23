import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Animation",
  description: "Browse animated movies and shows on Watchera.",
  alternates: { canonical: "/animation" },
};

export default function AnimationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

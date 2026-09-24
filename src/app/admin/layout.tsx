import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin panel for moderating Watchera users.",
  alternates: { canonical: "/admin" },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

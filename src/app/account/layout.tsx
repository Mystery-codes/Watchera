import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: true },
};

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
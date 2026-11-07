import type { Metadata } from "next";
import Link from "next/link";
import { SiteInfoPage } from "@/components/site-info-page";

export const metadata: Metadata = {
  title: "Press",
  description: "Press inquiries for Watchera.",
  alternates: { canonical: "/press" },
};

export default function PressPage() {
  return (
    <SiteInfoPage
      title="Press"
      intro="For press and media inquiries, contact Watchera by email."
      sections={[
        { title: "Media inquiries", content: <Link className="text-foreground underline" href="mailto:watchera205@gmail.com">watchera205@gmail.com</Link> },
      ]}
    />
  );
}
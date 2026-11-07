import type { Metadata } from "next";
import Link from "next/link";
import { SiteInfoPage } from "@/components/site-info-page";

export const metadata: Metadata = {
  title: "Careers",
  description: "Career information from Watchera.",
  alternates: { canonical: "/careers" },
};

export default function CareersPage() {
  return (
    <SiteInfoPage
      title="Careers"
      intro="There are no open roles posted on this page right now."
      sections={[
        { title: "Get in touch", content: <>For general inquiries, contact <Link className="text-foreground underline" href="mailto:watchera205@gmail.com">watchera205@gmail.com</Link>. Please do not send confidential personal information.</> },
      ]}
    />
  );
}
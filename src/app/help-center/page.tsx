import type { Metadata } from "next";
import Link from "next/link";
import { SiteInfoPage } from "@/components/site-info-page";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Get help using Watchera.",
  alternates: { canonical: "/help-center" },
};

export default function HelpCenterPage() {
  return (
    <SiteInfoPage
      title="Help Center"
      intro="Find quick answers about the current Watchera features."
      sections={[
        { title: "Using My List", content: "Use the add-to-list control on a title to save it. My List is stored in this browser and does not sync to another device." },
        { title: "Your account", content: <>Visit <Link className="text-foreground underline" href="/account">Account</Link> to sign in or create an account. For help, email <Link className="text-foreground underline" href="mailto:watchera205@gmail.com">watchera205@gmail.com</Link> or <Link className="text-foreground underline" href="https://wa.me/2349027237737" target="_blank" rel="noreferrer">message us on WhatsApp</Link>.</> },
        { title: "Downloads", content: "Downloads and the download queue are available in supported browsers. Availability can depend on the title and your account." },
      ]}
    />
  );
}
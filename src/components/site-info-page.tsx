import type { ReactNode } from "react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export type InfoSection = { title: string; content: ReactNode };

export function SiteInfoPage({
  title,
  intro,
  sections,
  reviewNotice = false,
}: {
  title: string;
  intro: string;
  sections: InfoSection[];
  reviewNotice?: boolean;
}) {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <article className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Watchera home</Link>
        <h1 className="mt-4 text-3xl font-bold">{title}</h1>
        {reviewNotice && (
          <p className="mt-5 border-l-2 border-primary pl-4 text-sm text-muted-foreground">
            For owner and legal review. This page is not final legal advice or an approved policy.
          </p>
        )}
        <p className="mt-5 leading-7 text-muted-foreground">{intro}</p>
        <div className="mt-8 space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <div className="mt-2 leading-7 text-muted-foreground">{section.content}</div>
            </section>
          ))}
        </div>
      </article>
      <Footer />
    </main>
  );
}
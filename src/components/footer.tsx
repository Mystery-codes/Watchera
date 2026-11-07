import Link from "next/link";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "TV Shows", href: "/popular-series" },
      { label: "Movies", href: "/movies" },
      { label: "New Releases", href: "/new-releases" },
      { label: "My List", href: "/my-list" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help-center" },
      { label: "Account", href: "/account" },
      { label: "Ways to Watch", href: "/ways-to-watch" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-black px-4 py-10 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-sm font-semibold text-white">{col.title}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-7xl text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Watchera. Unlimited movies, TV shows, and more.
      </p>
    </footer>
  );
}

import Link from "next/link";

const columns: { title: string; links: string[] }[] = [
  { title: "Explore", links: ["Home", "TV Shows", "Movies", "New Releases", "My List"] },
  { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
  { title: "Support", links: ["Help Center", "Account", "Ways to Watch", "Terms"] },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-black px-4 py-10 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-sm font-semibold text-white">{col.title}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l}>
                  <Link href="#" className="transition-colors hover:text-white">
                    {l}
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

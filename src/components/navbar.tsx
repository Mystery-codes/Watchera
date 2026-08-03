"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Menu, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { AuthDialog } from "@/components/auth-dialog";

const links: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "TV Series", href: "/popular-series" },
  { label: "Movies", href: "/search?q=Movies" },
  { label: "Animation", href: "/animation" },
  { label: "Subscription", href: "#" },
];

export function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ email: data.user.email ?? "" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email ?? "" } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled
          ? "bg-black/90 backdrop-blur"
          : "bg-gradient-to-b from-black/80 to-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-8">
        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
          Watchera
        </span>
        <ul className="hidden items-center gap-6 text-sm text-zinc-300 lg:flex">
          {links.map((l) => (
            <li key={l.label} className="cursor-pointer transition-colors hover:text-white">
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-4 text-zinc-300">
          {searchOpen ? (
            <form onSubmit={submitSearch} className="flex items-center">
              <input
                ref={searchInputRef}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search movies..."
                className="w-36 rounded-full border border-white/30 bg-black/60 px-3 py-1 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary sm:w-48"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchValue("");
                }}
                className="ml-1 text-zinc-300 hover:text-white"
                aria-label="Close search"
              >
                <X className="size-5" />
              </button>
            </form>
          ) : (
            <Search
              className="size-5 cursor-pointer hover:text-white"
              onClick={() => setSearchOpen(true)}
            />
          )}
          <Bell className="size-5 cursor-pointer hover:text-white" />
          <Menu className="size-5 cursor-pointer lg:hidden" />

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-[140px] truncate text-sm text-white sm:block">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="grid size-8 place-items-center rounded-full border border-white/30 text-white hover:bg-white/10"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { AuthDialog } from "@/components/auth-dialog";

const links = ["Home", "TV Shows", "Movies", "New & Popular", "My List"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

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
        <span className="text-2xl font-extrabold tracking-tight text-primary">
          CINEVERSE
        </span>
        <ul className="hidden items-center gap-6 text-sm text-zinc-300 lg:flex">
          {links.map((l) => (
            <li
              key={l}
              className="cursor-pointer transition-colors hover:text-white"
            >
              {l}
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-4 text-zinc-300">
          <Search className="size-5 cursor-pointer hover:text-white" />
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

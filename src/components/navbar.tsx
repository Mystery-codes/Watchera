"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const links = ["Home", "TV Shows", "Movies", "New & Popular", "My List"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled ? "bg-black/90 backdrop-blur" : "bg-gradient-to-b from-black/80 to-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-8">
        <span className="text-2xl font-extrabold tracking-tight text-primary">
          FLIX
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
          <span className="grid size-8 place-items-center rounded bg-gradient-to-br from-primary to-orange-500 text-sm font-bold text-white">
            F
          </span>
        </div>
      </nav>
    </header>
  );
}

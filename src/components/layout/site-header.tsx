"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { texts } from "@/lib/config/texts";

const navItems = [
  { href: "/", label: texts.app.nav.home },
  { href: "/gallery", label: texts.app.nav.gallery },
];

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <header className="mb-7 border-b border-[var(--border-soft)] bg-white/90 py-3 sm:mb-9 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{texts.app.title}</h1>
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--foreground)] decoration-[var(--accent)] decoration-2 underline-offset-4 transition hover:bg-[var(--accent-soft)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

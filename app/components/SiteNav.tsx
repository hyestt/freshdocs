"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Brand from "./Brand";

/** Shared top navigation for the public pages. */
export default function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  const link = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`rounded-full px-3.5 py-2 text-sm font-medium ${
        pathname === href || (href !== "/" && pathname.startsWith(href))
          ? "bg-[#e8f1ec] text-[#126b52]"
          : "text-[#5d6c64] hover:bg-[#f1f3ef] hover:text-[#14231d]"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[#dfe5df]/90 bg-[#fbfcf9]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {link("/docs", "Docs")}
          {link("/demo", "Live demo")}
          <a
            href="/#pricing"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-[#5d6c64] hover:bg-[#f1f3ef] hover:text-[#14231d]"
          >
            Pricing
          </a>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/admin"
            className="px-2 py-2 text-sm font-medium text-[#5d6c64] hover:text-[#14231d]"
          >
            Sign in
          </Link>
          <Link
            href="/admin"
            className="rounded-full bg-[#14231d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#126b52]"
          >
            Open workspace
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className="flex size-10 items-center justify-center rounded-full border border-[#d8e0da] bg-white text-[#263b32] md:hidden"
        >
          {menuOpen ? (
            <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
              <path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
            </svg>
          )}
        </button>
      </div>
      {menuOpen && (
        <div id="mobile-navigation" className="border-t border-[#dfe5df] bg-[#fbfcf9] px-5 py-4 shadow-lg md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
            <Link href="/docs" className="rounded-xl px-3 py-3 text-sm font-medium text-[#263b32] hover:bg-[#f1f3ef]">Help center</Link>
            <Link href="/demo" className="rounded-xl px-3 py-3 text-sm font-medium text-[#263b32] hover:bg-[#f1f3ef]">Chat widget demo</Link>
            <a href="/#pricing" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-[#263b32] hover:bg-[#f1f3ef]">Pricing</a>
            <div className="my-2 border-t border-[#e1e6e2]" />
            <Link href="/admin" className="rounded-xl px-3 py-3 text-sm font-medium text-[#5d6c64]">Sign in</Link>
            <Link href="/admin" className="mt-1 rounded-full bg-[#126b52] px-4 py-3 text-center text-sm font-semibold text-white">Open workspace</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

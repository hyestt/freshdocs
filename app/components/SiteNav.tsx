"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "./Brand";

/** Shared top navigation for the public pages. */
export default function SiteNav() {
  const pathname = usePathname();
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
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin"
            className="hidden px-2 py-2 text-sm font-medium text-[#5d6c64] hover:text-[#14231d] sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/demo"
            className="rounded-full bg-[#14231d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#126b52]"
          >
            Try the demo
          </Link>
        </div>
      </div>
    </header>
  );
}

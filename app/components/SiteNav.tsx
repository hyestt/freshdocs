"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Shared top navigation for the public pages. */
export default function SiteNav() {
  const pathname = usePathname();
  const link = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname === href
          ? "text-teal-700 dark:text-teal-300"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-lg font-bold text-white">
            F
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            FreshDocs
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {link("/docs", "Docs")}
          {link("/demo", "Widget demo")}
          <a
            href="/#early-access"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Early access
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/demo"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            Try it live
          </Link>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ArticleSummary {
  id: number;
  title: string;
  slug: string;
  status: string;
}

/** Client-side search box + article list for /docs. */
export default function DocsExplorer({ initial }: { initial: ArticleSummary[] }) {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<ArticleSummary[]>(initial);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setArticles(initial);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`/api/articles?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setArticles(data.articles ?? []);
      } catch {
        // keep previous results on error
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, initial]);

  return (
    <div>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the help center…"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-11 text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
      </div>

      <div className="mt-8 grid gap-4">
        {searching && <p className="text-sm text-slate-500">Searching…</p>}
        {!searching && articles.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
            {query ? (
              <>No articles match “{query}”. Try different words.</>
            ) : (
              <>
                No articles yet.{" "}
                <Link href="/admin" className="text-teal-700 underline dark:text-teal-300">
                  Open the admin dashboard
                </Link>{" "}
                to seed demo data or ingest your docs.
              </>
            )}
          </div>
        )}
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/docs/${a.slug}`}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold group-hover:text-teal-700 dark:group-hover:text-teal-300">
                {a.title}
              </h2>
              {a.status === "stale" && (
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                  Needs review
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">Read article →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

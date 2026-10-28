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
          placeholder="Search by topic or question…"
          aria-label="Search help articles"
          className="w-full rounded-2xl border border-[#ccd6cf] bg-white py-4 pl-12 pr-4 text-[#14231d] shadow-sm placeholder:text-[#9aa59f] focus:border-[#126b52] focus:outline-none"
        />
        <svg viewBox="0 0 20 20" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#7b8881]" fill="none" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="m12.5 12.5 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7b8881]">
            {query ? "Search results" : "All guides"}
          </p>
          <p className="text-xs text-[#9aa59f]">{articles.length} article{articles.length === 1 ? "" : "s"}</p>
        </div>
        {searching && <p className="py-6 text-sm text-[#7b8881]">Searching…</p>}
        {!searching && articles.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#cbd6ce] bg-white p-10 text-center text-sm text-[#69776f]">
            {query ? (
              <>No articles match “{query}”. Try different words.</>
            ) : (
              <>
                No articles yet.{" "}
                <Link href="/admin" className="font-medium text-[#126b52] underline underline-offset-4">
                  Open the admin dashboard
                </Link>{" "}
                to seed demo data or ingest your docs.
              </>
            )}
          </div>
        )}
        {articles.length > 0 && (
          <div className="divide-y divide-[#e1e6e2] overflow-hidden rounded-2xl border border-[#d8e0da] bg-white">
            {articles.map((a) => (
            <Link
              key={a.id}
              href={`/docs/${a.slug}`}
              className="group flex items-center justify-between gap-5 px-5 py-5 hover:bg-[#f6f8f4] sm:px-6"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold tracking-[-0.015em] group-hover:text-[#126b52]">{a.title}</h2>
                  {a.status === "stale" && (
                    <span className="rounded-full bg-[#fff3cf] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#765d12]">
                      Review pending
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[#7b8881]">Read the guide</p>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#d8e0da] text-[#7b8881] group-hover:border-[#b7c9be] group-hover:bg-white group-hover:text-[#126b52]">
                <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
                  <path d="M4 10h12m-4-4 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </span>
            </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

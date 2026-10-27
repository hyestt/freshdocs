import Link from "next/link";

interface DocsNavArticle {
  id: number;
  title: string;
  slug: string;
}

export default function DocsSidebar({
  articles,
  activeSlug,
}: {
  articles: DocsNavArticle[];
  activeSlug?: string;
}) {
  return (
    <aside className="hidden border-r border-[#e1e6e2] pr-7 lg:block">
      <nav className="sticky top-28" aria-label="Documentation">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a9690]">
          Documentation
        </p>
        <div className="mt-3 space-y-1">
          <Link
            href="/docs"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
              !activeSlug
                ? "bg-[#e8f1ec] text-[#126b52]"
                : "text-[#5d6c64] hover:bg-[#f1f3ef] hover:text-[#14231d]"
            }`}
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
              <path d="M3.5 5.5A2 2 0 0 1 5.5 3.5h2.25A2.25 2.25 0 0 1 10 5.75V16a2 2 0 0 0-2-2H3.5V5.5Zm13 0a2 2 0 0 0-2-2h-2.25A2.25 2.25 0 0 0 10 5.75V16a2 2 0 0 1 2-2h4.5V5.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
            </svg>
            Guide home
          </Link>
        </div>

        {articles.length > 0 && (
          <>
            <p className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a9690]">
              All guides
            </p>
            <div className="mt-3 space-y-1">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/docs/${article.slug}`}
                  className={`block rounded-xl px-3 py-2.5 text-sm leading-5 ${
                    activeSlug === article.slug
                      ? "bg-[#e8f1ec] font-medium text-[#126b52]"
                      : "text-[#5d6c64] hover:bg-[#f1f3ef] hover:text-[#14231d]"
                  }`}
                >
                  {article.title}
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="mt-8 rounded-2xl bg-[#f0f4f0] p-4">
          <p className="text-sm font-semibold">Need a quick answer?</p>
          <p className="mt-1 text-xs leading-5 text-[#69776f]">Ask the assistant and get a cited response.</p>
          <Link href="/demo" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#126b52] hover:gap-2">
            Open assistant
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}

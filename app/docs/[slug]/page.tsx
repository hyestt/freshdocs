import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";
import { getArticleBySlug, getArticles } from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export default async function DocsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const others = (await getArticles())
    .filter((a) => a.id !== article.id)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#fbfcf9] text-[#14231d]">
      <SiteNav />
      <main>
        <div className="border-b border-[#dfe5df] bg-[#f2f6f2]">
          <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
            <Link href="/docs" className="inline-flex items-center gap-2 text-sm font-medium text-[#5d6c64] hover:text-[#126b52]">
              <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
                <path d="M16 10H4m4-4-4 4 4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
              Help center
            </Link>
            <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
              {article.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#7b8881]">
              <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
              {article.checked_at && (
                <>
                  <span className="size-1 rounded-full bg-[#b5beb8]" />
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[#20a77a]" />
                    Audited {new Date(article.checked_at).toLocaleDateString()}
                  </span>
                </>
              )}
              {article.status === "stale" && (
                <span className="rounded-full bg-[#fff1c2] px-2.5 py-1 font-semibold text-[#725a16]">
                  Update pending review
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-14 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_240px]">
          <article
            className="fd-prose min-w-0"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.markdown) }}
          />
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-[#d8e0da] bg-white p-5">
              <p className="font-semibold">Still have questions?</p>
              <p className="mt-2 text-sm leading-6 text-[#69776f]">
                Ask the assistant. Every answer links back to an approved guide.
              </p>
              <Link
                href="/demo"
                className="mt-5 flex items-center justify-center rounded-full bg-[#126b52] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0e5b45]"
              >
                Ask FreshDocs
              </Link>
            </div>
            {others.length > 0 && (
              <div className="rounded-2xl bg-[#f1f4f0] p-5">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7b8881]">More guides</h2>
                <ul className="mt-4 divide-y divide-[#dce3dd]">
                  {others.slice(0, 4).map((o) => (
                    <li key={o.id}>
                      <Link href={`/docs/${o.slug}`} className="block py-3 text-sm font-medium leading-5 hover:text-[#126b52]">
                        {o.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

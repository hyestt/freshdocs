import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";
import DocsSidebar from "../DocsSidebar";
import { orderArticles } from "../article-order";
import { getArticleBySlug, getArticles } from "@/lib/data";
import { getMarkdownHeadings, renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export default async function DocsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const articles = orderArticles(await getArticles());
  const headings = getMarkdownHeadings(article.markdown);
  const articleIndex = articles.findIndex((item) => item.id === article.id);
  const previousArticle = articleIndex > 0 ? articles[articleIndex - 1] : null;
  const nextArticle =
    articleIndex >= 0 && articleIndex < articles.length - 1
      ? articles[articleIndex + 1]
      : null;

  return (
    <div className="min-h-screen bg-[#fbfcf9] text-[#14231d]">
      <SiteNav />
      <main>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[220px_minmax(0,720px)_230px]">
          <DocsSidebar articles={articles} activeSlug={article.slug} />

          <div className="min-w-0">
            <details className="mb-7 rounded-2xl border border-[#d8e0da] bg-white p-2 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-[#263b32] [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <svg viewBox="0 0 20 20" className="size-4 text-[#126b52]" fill="none" aria-hidden="true">
                    <path d="M3.5 5.5A2 2 0 0 1 5.5 3.5h2.25A2.25 2.25 0 0 1 10 5.75V16a2 2 0 0 0-2-2H3.5V5.5Zm13 0a2 2 0 0 0-2-2h-2.25A2.25 2.25 0 0 0 10 5.75V16a2 2 0 0 1 2-2h4.5V5.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
                  </svg>
                  Browse guides
                </span>
                <svg viewBox="0 0 20 20" className="size-4 text-[#7b8881]" fill="none" aria-hidden="true">
                  <path d="m6 8 4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </summary>
              <nav className="mt-1 border-t border-[#e6ebe7] px-2 pb-2 pt-3" aria-label="Mobile documentation">
                <Link href="/docs" className="block rounded-lg px-3 py-2 text-sm text-[#5d6c64] hover:bg-[#f1f3ef]">
                  Guide home
                </Link>
                {articles.map((item) => (
                  <Link
                    key={item.id}
                    href={`/docs/${item.slug}`}
                    className={`block rounded-lg px-3 py-2 text-sm leading-5 ${
                      item.id === article.id
                        ? "bg-[#e8f1ec] font-medium text-[#126b52]"
                        : "text-[#5d6c64] hover:bg-[#f1f3ef]"
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </details>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#7b8881]">
              <Link href="/docs" className="hover:text-[#126b52]">Help center</Link>
              <span className="text-[#b0b9b3]">/</span>
              <span className="max-w-[260px] truncate text-[#126b52]">{article.title}</span>
            </div>
            <header className="border-b border-[#e1e6e2] pb-9 pt-7">
              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-[3.35rem]">
                {article.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-[#69776f]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#dfe5df] bg-white px-3 py-1.5">
                  <svg viewBox="0 0 20 20" className="size-3.5" fill="none" aria-hidden="true">
                    <path d="M5 3.5v2m10-2v2M3.5 8h13M5.5 5h9A1.5 1.5 0 0 1 16 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5v-8A1.5 1.5 0 0 1 5.5 5Z" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" />
                  </svg>
                  Updated {new Date(article.updated_at).toLocaleDateString()}
                </span>
                {article.checked_at && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe2d7] bg-[#f0f7f3] px-3 py-1.5 text-[#426456]">
                      <span className="size-1.5 rounded-full bg-[#20a77a]" aria-hidden="true" />
                      Source checked {new Date(article.checked_at).toLocaleDateString()}
                    </span>
                )}
                {article.status === "stale" && (
                  <span className="rounded-full bg-[#fff1c2] px-3 py-1.5 font-semibold text-[#725a16]">
                    Update pending review
                  </span>
                )}
              </div>
            </header>
            <article
              className="fd-prose min-w-0 pt-9"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(article.markdown) }}
            />
            <div className="mt-14 flex flex-col gap-5 rounded-2xl border border-[#cfe0d6] bg-[#eef6f1] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Was this guide helpful?</p>
                <p className="mt-1 text-sm text-[#69776f]">Still stuck? The assistant can search every approved article.</p>
              </div>
              <Link href="/demo" className="shrink-0 rounded-full bg-[#126b52] px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0e5b45]">
                Ask the assistant
              </Link>
            </div>
            {(previousArticle || nextArticle) && (
              <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Adjacent guides">
                {previousArticle ? (
                  <Link href={`/docs/${previousArticle.slug}`} className="group rounded-2xl border border-[#d8e0da] bg-white p-5 hover:border-[#b7c9be] hover:shadow-sm">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a9690]">Previous guide</span>
                    <span className="mt-2 flex items-center gap-2 text-sm font-semibold group-hover:text-[#126b52]">
                      <span aria-hidden="true">←</span>
                      {previousArticle.title}
                    </span>
                  </Link>
                ) : <span />}
                {nextArticle && (
                  <Link href={`/docs/${nextArticle.slug}`} className="group rounded-2xl border border-[#d8e0da] bg-white p-5 text-right hover:border-[#b7c9be] hover:shadow-sm">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a9690]">Next guide</span>
                    <span className="mt-2 flex items-center justify-end gap-2 text-sm font-semibold group-hover:text-[#126b52]">
                      {nextArticle.title}
                      <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                )}
              </nav>
            )}
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-28">
              {headings.length > 0 && (
                <nav aria-label="On this page">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8881]">On this page</p>
                  <ul className="mt-3 space-y-1 border-l border-[#dfe5df]">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          className={`block border-l border-transparent py-1.5 text-[13px] leading-5 text-[#69776f] hover:border-[#126b52] hover:text-[#126b52] ${
                            heading.level === 3 ? "pl-6" : "pl-4"
                          }`}
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              <div className="mt-8 rounded-2xl bg-[#eef4f0] p-4">
                <p className="text-sm font-semibold">Article status</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#426456]">
                  <span className={`size-2 rounded-full ${article.source_url ? "bg-[#20a77a]" : "bg-[#a8b2ac]"}`} />
                  {article.source_url ? "Source monitoring active" : "Manually maintained"}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

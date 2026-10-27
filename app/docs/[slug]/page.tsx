import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";
import DocsSidebar from "../DocsSidebar";
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

  const articles = await getArticles();
  const headings = getMarkdownHeadings(article.markdown);

  return (
    <div className="min-h-screen bg-[#fbfcf9] text-[#14231d]">
      <SiteNav />
      <main>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[220px_minmax(0,680px)_220px]">
          <DocsSidebar articles={articles} activeSlug={article.slug} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#7b8881]">
              <Link href="/docs" className="hover:text-[#126b52]">Help center</Link>
              <span className="text-[#b0b9b3]">/</span>
              <span className="max-w-[260px] truncate text-[#126b52]">{article.title}</span>
            </div>
            <header className="border-b border-[#e1e6e2] pb-8 pt-7">
              <h1 className="text-4xl font-semibold leading-[1.12] tracking-[-0.045em] sm:text-5xl">
                {article.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#7b8881]">
                <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
                {article.checked_at && (
                  <>
                    <span className="size-1 rounded-full bg-[#b5beb8]" />
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-[#20a77a]" />
                      Source checked {new Date(article.checked_at).toLocaleDateString()}
                    </span>
                  </>
                )}
                {article.status === "stale" && (
                  <span className="rounded-full bg-[#fff1c2] px-2.5 py-1 font-semibold text-[#725a16]">
                    Update pending review
                  </span>
                )}
              </div>
            </header>
            <article
              className="fd-prose min-w-0 pt-8"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(article.markdown) }}
            />
            <div className="mt-14 flex flex-col gap-4 rounded-2xl border border-[#d8e0da] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Was this guide helpful?</p>
                <p className="mt-1 text-sm text-[#69776f]">Still stuck? The assistant can search every approved article.</p>
              </div>
              <Link href="/demo" className="shrink-0 rounded-full bg-[#126b52] px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0e5b45]">
                Ask the assistant
              </Link>
            </div>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-28">
              {headings.length > 0 && (
                <nav aria-label="On this page">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a9690]">On this page</p>
                  <ul className="mt-3 space-y-1 border-l border-[#dfe5df]">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          className={`block border-l border-transparent py-1.5 text-xs leading-5 text-[#69776f] hover:border-[#126b52] hover:text-[#126b52] ${
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
                <p className="text-sm font-semibold">Freshness status</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#426456]">
                  <span className="size-2 rounded-full bg-[#20a77a]" />
                  Source monitoring active
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

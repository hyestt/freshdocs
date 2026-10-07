import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNav from "../../components/SiteNav";
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
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/docs"
          className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
        >
          ← All articles
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Last updated {new Date(article.updated_at).toLocaleDateString()}
          {article.checked_at &&
            ` · Audited ${new Date(article.checked_at).toLocaleDateString()}`}
          {article.status === "stale" && (
            <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              Update pending review
            </span>
          )}
        </p>

        <article
          className="fd-prose mt-8"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.markdown) }}
        />

        <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="font-semibold">Still have questions?</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Ask the AI assistant — it answers from these very articles and cites its sources.
          </p>
          <Link
            href="/demo"
            className="mt-4 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Try the chat widget
          </Link>
        </div>

        {others.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold">More articles</h2>
            <ul className="mt-3 space-y-2">
              {others.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/docs/${o.slug}`}
                    className="text-teal-700 hover:underline dark:text-teal-300"
                  >
                    {o.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

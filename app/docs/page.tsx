import SiteNav from "../components/SiteNav";
import { getArticles } from "@/lib/data";
import DocsExplorer from "./DocsExplorer";

export const dynamic = "force-dynamic";

export default async function DocsIndexPage() {
  const articles = (await getArticles()).map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    status: a.status,
  }));

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Help center</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Every article below is audited by AI against its source — what you read is what
          the product actually does.
        </p>
        <div className="mt-8">
          <DocsExplorer initial={articles} />
        </div>
      </main>
    </div>
  );
}

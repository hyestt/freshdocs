import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
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
    <div className="min-h-screen bg-[#fbfcf9] text-[#14231d]">
      <SiteNav />
      <main>
        <section className="border-b border-[#dfe5df] bg-[#f2f6f2]">
          <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#126b52]">FreshDocs support</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">How can we help?</h1>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-[#69776f]">
              Clear, source-checked guides for setting up and getting the most from your workspace.
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <DocsExplorer initial={articles} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

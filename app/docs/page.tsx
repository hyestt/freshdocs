import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import { getArticles } from "@/lib/data";
import DocsExplorer from "./DocsExplorer";
import DocsSidebar from "./DocsSidebar";
import { orderArticles } from "./article-order";

export const dynamic = "force-dynamic";

export default async function DocsIndexPage() {
  const articles = orderArticles(
    (await getArticles()).map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      status: a.status,
    }))
  );

  return (
    <div className="min-h-screen bg-[#fbfcf9] text-[#14231d]">
      <SiteNav />
      <main>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
          <DocsSidebar articles={articles} />
          <div className="min-w-0">
            <div className="rounded-[24px] bg-[#edf4f0] px-6 py-10 sm:px-10 sm:py-12">
              <div className="flex items-center gap-2 text-xs font-medium text-[#69776f]">
                <span>Help center</span>
                <span className="text-[#a4aea8]">/</span>
                <span className="text-[#126b52]">Guide home</span>
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Find the answer, then get back to work.
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-[#5d6c64]">
                Browse clear, source-checked guides for setting up and getting the most from your workspace.
              </p>
            </div>
            <div className="mt-10">
              <DocsExplorer initial={articles} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

import { NextRequest } from "next/server";
import { isAuthed, unauthorized } from "@/lib/auth";
import { crawlDocs } from "@/lib/crawl";
import { articleExistsBySourceUrl, insertArticle } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * POST /api/ingest — add articles to the help center.
 * Body: { url } to crawl a docs site (same-origin, max 30 pages),
 *    or { title, markdown } to add a single article directly.
 */
export async function POST(req: NextRequest) {
  if (!(await isAuthed(req))) return unauthorized();

  let body: { url?: unknown; title?: unknown; markdown?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // --- Crawl mode ---
  if (typeof body.url === "string" && body.url.trim()) {
    const start = body.url.trim();
    let parsed: URL;
    try {
      parsed = new URL(start);
    } catch {
      return Response.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return Response.json({ error: "Only http(s) URLs can be crawled." }, { status: 400 });
    }
    const pages = await crawlDocs(start, 30);
    let added = 0;
    let skipped = 0;
    for (const p of pages) {
      if (await articleExistsBySourceUrl(p.url)) {
        skipped++;
        continue;
      }
      await insertArticle({ title: p.title, markdown: p.markdown, sourceUrl: p.url });
      added++;
    }
    return Response.json({ ok: true, crawled: pages.length, added, skipped });
  }

  // --- Paste mode ---
  if (typeof body.markdown === "string" && body.markdown.trim()) {
    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : body.markdown.trim().split("\n")[0].replace(/^#+\s*/, "").slice(0, 120) || "Untitled article";
    const article = await insertArticle({ title, markdown: body.markdown });
    return Response.json({ ok: true, added: 1, article: { id: article.id, slug: article.slug } });
  }

  return Response.json(
    { error: 'Provide either { "url" } to crawl or { "title", "markdown" } to add an article.' },
    { status: 400 }
  );
}

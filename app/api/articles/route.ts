import { NextRequest } from "next/server";
import { getArticles, searchArticles } from "@/lib/data";

export const dynamic = "force-dynamic";

/** GET /api/articles — list articles (id, title, slug, status, timestamps). ?q= searches. */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const articles = q ? await searchArticles(q) : await getArticles();
  return Response.json({
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      status: a.status,
      source_url: a.source_url,
      updated_at: a.updated_at,
      checked_at: a.checked_at,
    })),
  });
}

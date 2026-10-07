import { NextRequest } from "next/server";
import { getArticleById } from "@/lib/data";

export const dynamic = "force-dynamic";

/** GET /api/articles/[id] — full article incl. markdown. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await getArticleById(Number(id));
  if (!article) return Response.json({ error: "Article not found." }, { status: 404 });
  return Response.json({ article });
}

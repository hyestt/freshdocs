import { NextRequest } from "next/server";
import { searchArticles } from "@/lib/data";
import { answerQuestion, type ChatDoc } from "@/lib/llm";

export const dynamic = "force-dynamic";

/**
 * POST /api/chat — { message } → retrieve top articles via FTS5, then answer.
 * Works with or without an LLM key (extractive fallback in demo mode).
 */
export async function POST(req: NextRequest) {
  let body: { message?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return Response.json({ error: "message is required." }, { status: 400 });
  }

  const hits = await searchArticles(message, 3);
  const docs: ChatDoc[] = hits.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    markdown: a.markdown,
  }));

  const { answer, citations } = await answerQuestion(message, docs);
  return Response.json({ answer, citations });
}

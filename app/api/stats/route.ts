import { NextRequest } from "next/server";
import { isAuthed, unauthorized } from "@/lib/auth";
import { getStats } from "@/lib/data";
import { llmConfigured } from "@/lib/llm";

export const dynamic = "force-dynamic";

/** GET /api/stats — dashboard numbers. */
export async function GET(req: NextRequest) {
  if (!(await isAuthed(req))) return unauthorized();
  return Response.json({ ...(await getStats()), llm: llmConfigured() ? "llm" : "heuristic" });
}

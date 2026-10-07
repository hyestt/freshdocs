import { NextRequest } from "next/server";
import { isAuthed, unauthorized } from "@/lib/auth";
import { articleExistsByTitle, insertArticle } from "@/lib/data";
import { SEED_ARTICLES } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

/** POST /api/seed — insert the sample help articles (skips ones already present). */
export async function POST(req: NextRequest) {
  if (!(await isAuthed(req))) return unauthorized();
  let added = 0;
  let skipped = 0;
  for (const s of SEED_ARTICLES) {
    if (await articleExistsByTitle(s.title)) {
      skipped++;
      continue;
    }
    await insertArticle({ title: s.title, markdown: s.markdown });
    added++;
  }
  return Response.json({ ok: true, added, skipped, total: SEED_ARTICLES.length });
}

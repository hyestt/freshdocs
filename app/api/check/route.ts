import { NextRequest } from "next/server";
import { isAuthed, unauthorized } from "@/lib/auth";
import { fetchPage } from "@/lib/crawl";
import {
  createDraft,
  getArticles,
  logCheck,
  setArticleStatus,
  touchChecked,
} from "@/lib/data";
import { changeRatio } from "@/lib/diff";
import { judgeStaleness, llmConfigured } from "@/lib/llm";

export const dynamic = "force-dynamic";

const MIN_RATIO_TO_AUDIT = 0.08; // below this, the source barely changed — skip the LLM

/**
 * POST /api/check — audit every article that has a source URL.
 *
 * For each article: re-fetch its source page, diff against the stored copy,
 * and if the change is material, ask the LLM whether the article is stale.
 * Stale articles get a pending draft; everything is recorded in `checks`.
 */
export async function POST(req: NextRequest) {
  if (!(await isAuthed(req))) return unauthorized();

  const articles = (await getArticles()).filter((a) => a.source_url);
  const results: {
    articleId: number;
    title: string;
    changed: boolean;
    stale: boolean;
    reason: string;
  }[] = [];

  for (const article of articles) {
    const page = await fetchPage(article.source_url!);
    if (!page) {
      const reason = "Could not re-fetch the source page (network error or non-HTML).";
      await logCheck(article.id, false, reason);
      await touchChecked(article.id);
      results.push({ articleId: article.id, title: article.title, changed: false, stale: false, reason });
      continue;
    }

    const ratio = changeRatio(article.markdown, page.markdown);
    if (ratio < MIN_RATIO_TO_AUDIT) {
      const reason = `Source page essentially unchanged (${Math.round(ratio * 100)}% lines changed).`;
      await logCheck(article.id, false, reason);
      await touchChecked(article.id);
      results.push({ articleId: article.id, title: article.title, changed: false, stale: false, reason });
      continue;
    }

    const judgment = await judgeStaleness(article.title, article.markdown, page.markdown, ratio);
    if (judgment.stale) {
      await createDraft(article.id, judgment.proposedMarkdown, judgment.reason);
      await setArticleStatus(article.id, "stale");
      await logCheck(article.id, true, `STALE — ${judgment.reason}`);
    } else {
      await logCheck(article.id, true, `Changed but not stale — ${judgment.reason}`);
    }
    await touchChecked(article.id);
    results.push({
      articleId: article.id,
      title: article.title,
      changed: true,
      stale: judgment.stale,
      reason: judgment.reason,
    });
  }

  return Response.json({
    ok: true,
    llm: llmConfigured() ? "llm" : "heuristic",
    checked: articles.length,
    stale: results.filter((r) => r.stale).length,
    results,
  });
}

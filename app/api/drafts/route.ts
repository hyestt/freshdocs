import { NextRequest } from "next/server";
import { isAuthed, unauthorized } from "@/lib/auth";
import { getDrafts } from "@/lib/data";
import { diffLines, type DiffOp } from "@/lib/diff";

export const dynamic = "force-dynamic";

export interface DraftListItem {
  id: number;
  article_id: number;
  article_title: string;
  status: string;
  reason: string;
  created_at: string;
  proposed_markdown: string;
  /** Line ops for the side-by-side review UI. */
  ops: DiffOp[];
}

/** GET /api/drafts — pending (or all, with ?status=) drafts with computed diffs. */
export async function GET(req: NextRequest) {
  if (!(await isAuthed(req))) return unauthorized();
  const status = req.nextUrl.searchParams.get("status");
  const drafts = await getDrafts(
    status === "approved" || status === "rejected" || status === "pending" ? status : "pending"
  );
  const items: DraftListItem[] = drafts.map((d) => ({
    id: d.id,
    article_id: d.article_id,
    article_title: d.article_title,
    status: d.status,
    reason: d.reason,
    created_at: d.created_at,
    proposed_markdown: d.proposed_markdown,
    ops: diffLines(d.article_markdown, d.proposed_markdown),
  }));
  return Response.json({ drafts: items });
}

import { NextRequest } from "next/server";
import { isAuthed, unauthorized } from "@/lib/auth";
import { getDraftById, rejectDraft } from "@/lib/data";

export const dynamic = "force-dynamic";

/** POST /api/drafts/[id]/reject — discard the draft, keep the article as-is. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthed(req))) return unauthorized();
  const { id } = await params;
  const draft = await getDraftById(Number(id));
  if (!draft || draft.status !== "pending") {
    return Response.json({ error: "Draft not found or not pending." }, { status: 400 });
  }
  await rejectDraft(Number(id));
  return Response.json({ ok: true });
}

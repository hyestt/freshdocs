import { NextRequest } from "next/server";
import { isAuthed, unauthorized } from "@/lib/auth";
import { approveDraft } from "@/lib/data";

export const dynamic = "force-dynamic";

/** POST /api/drafts/[id]/approve — publish the draft (optionally with edited markdown). */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthed(req))) return unauthorized();
  const { id } = await params;
  let body: { markdown?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // approving without an override is fine
  }
  const override =
    typeof body.markdown === "string" && body.markdown.trim() ? body.markdown : undefined;
  try {
    await approveDraft(Number(id), override);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }
  return Response.json({ ok: true });
}

import { NextRequest } from "next/server";
import { adminPassword, authCookieHeader } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST /api/login — { password } → sets the signed admin cookie. */
export async function POST(req: NextRequest) {
  let body: { password?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // fall through to invalid
  }
  if (typeof body.password !== "string" || body.password !== adminPassword()) {
    return Response.json({ error: "Invalid password." }, { status: 401 });
  }
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": await authCookieHeader() } }
  );
}

import { clearCookieHeader } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST /api/logout — clears the admin cookie. */
export async function POST() {
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": clearCookieHeader() } }
  );
}

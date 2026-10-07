// lib/auth.ts — minimal admin gate.
//
// POST /api/login with the right ADMIN_PASSWORD sets a signed, HttpOnly
// cookie. Mutating API routes and the /admin page check it via isAuthed().
// (No middleware.ts: per-route checks are simpler and version-proof.)
//
// Crypto uses WebCrypto (global `crypto.subtle`) only — no node:crypto — so
// this module runs unchanged in Node 24 and in Cloudflare Workers.
// The session token is HMAC-SHA256, byte-identical to the old node:crypto
// implementation, so existing login cookies keep working.

import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "fd_admin";

export function adminPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) {
    console.warn("[freshdocs] ADMIN_PASSWORD is not set — using default 'admin'. Set it in .env.local.");
    return "admin";
  }
  return p;
}

/** Deterministic signed session token (HMAC of a fixed label). */
async function expectedToken(): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(adminPassword()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode("freshdocs-admin-session")
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Length-sensitive constant-time comparison of two hex digests. */
function tokensEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Check the cookie on an incoming API request. */
export async function isAuthed(req: NextRequest): Promise<boolean> {
  const v = req.cookies.get(ADMIN_COOKIE)?.value;
  return !!v && tokensEqual(v, await expectedToken());
}

/** Check a raw cookie value (for server components reading next/headers). */
export async function isAuthedValue(v: string | undefined): Promise<boolean> {
  return !!v && tokensEqual(v, await expectedToken());
}

export async function authCookieHeader(): Promise<string> {
  return `${ADMIN_COOKIE}=${await expectedToken()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

export function clearCookieHeader(): string {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function unauthorized(): Response {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

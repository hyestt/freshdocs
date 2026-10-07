// lib/db-common.ts — backend-agnostic types and pure helpers for the data layer.
//
// Imported by both lib/db.ts (local better-sqlite3) and lib/db-d1.ts
// (Cloudflare D1), and re-exported through lib/data.ts. No Node or
// Workers-specific imports here — this module is safe everywhere.

export type ArticleStatus = "fresh" | "stale";
export type DraftStatus = "pending" | "approved" | "rejected";

export interface Article {
  id: number;
  title: string;
  slug: string;
  markdown: string;
  source_url: string | null;
  status: ArticleStatus;
  updated_at: string;
  checked_at: string | null;
}

export interface Draft {
  id: number;
  article_id: number;
  proposed_markdown: string;
  reason: string;
  status: DraftStatus;
  created_at: string;
}

export interface DraftWithArticle extends Draft {
  article_title: string;
  article_markdown: string;
}

export interface Stats {
  totalArticles: number;
  staleCount: number;
  pendingDrafts: number;
  lastCheckAt: string | null;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function slugify(title: string): string {
  const s = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return s || "article";
}

/** Turn free text into a safe FTS5 query (quoted OR terms). */
export function sanitizeFts(q: string): string | null {
  const terms = q
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1)
    .slice(0, 10);
  if (terms.length === 0) return null;
  return terms.map((t) => `"${t.replace(/"/g, "")}"`).join(" OR ");
}

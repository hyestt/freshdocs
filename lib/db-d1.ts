// lib/db-d1.ts — Cloudflare D1 implementation of the FreshDocs data layer.
//
// WORKERS BACKEND. Same exported function names and shapes as lib/db.ts, but
// every function is async (D1 is network-backed). Callers go through
// lib/data.ts, which selects this backend when DB_BACKEND=d1.
//
// The D1 binding comes from the worker environment (wrangler.toml
// [[d1_databases]] binding = "DB"). Schema is applied separately with
// `wrangler d1 execute --file=d1-schema.sql` — this module never migrates.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import {
  nowIso,
  sanitizeFts,
  slugify,
  type Article,
  type ArticleStatus,
  type Draft,
  type DraftStatus,
  type DraftWithArticle,
  type Stats,
} from "./db-common";

export type {
  Article,
  ArticleStatus,
  Draft,
  DraftStatus,
  DraftWithArticle,
  Stats,
};
export { nowIso, slugify };

/** Resolve the D1 database from the current worker's environment. */
async function d1(): Promise<D1Database> {
  const { env } = await getCloudflareContext();
  const db = (env as unknown as { DB?: D1Database }).DB;
  if (!db) {
    throw new Error(
      "D1 binding 'DB' is not configured. Set DB_BACKEND=d1 only on a Worker " +
        "with a [[d1_databases]] binding named DB (see wrangler.toml)."
    );
  }
  return db;
}

// ---------------------------------------------------------------- articles

export async function uniqueSlug(base: string): Promise<string> {
  const db = await d1();
  let slug = base;
  let i = 2;
  for (;;) {
    const row = await db
      .prepare("SELECT 1 AS one FROM articles WHERE slug = ?")
      .bind(slug)
      .first<{ one: number }>();
    if (!row) return slug;
    slug = `${base}-${i}`;
    i += 1;
  }
}

export async function insertArticle(input: {
  title: string;
  markdown: string;
  sourceUrl?: string | null;
}): Promise<Article> {
  const db = await d1();
  const slug = await uniqueSlug(slugify(input.title));
  const res = await db
    .prepare(
      "INSERT INTO articles (title, slug, markdown, source_url, status, updated_at) VALUES (?, ?, ?, ?, 'fresh', ?)"
    )
    .bind(input.title, slug, input.markdown, input.sourceUrl ?? null, nowIso())
    .run();
  const row = await getArticleById(Number(res.meta.last_row_id));
  if (!row) throw new Error("insertArticle: failed to read back inserted row");
  return row;
}

export async function getArticles(): Promise<Article[]> {
  const db = await d1();
  const { results } = await db
    .prepare("SELECT * FROM articles ORDER BY updated_at DESC")
    .all<Article>();
  return results;
}

export async function getArticleById(id: number): Promise<Article | undefined> {
  const db = await d1();
  const row = await db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .bind(id)
    .first<Article>();
  return row ?? undefined;
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const db = await d1();
  const row = await db
    .prepare("SELECT * FROM articles WHERE slug = ?")
    .bind(slug)
    .first<Article>();
  return row ?? undefined;
}

export async function searchArticles(q: string, limit = 20): Promise<Article[]> {
  const match = sanitizeFts(q);
  if (!match) return [];
  const db = await d1();
  const { results } = await db
    .prepare(
      `SELECT articles.* FROM articles_fts
         JOIN articles ON articles.id = articles_fts.rowid
       WHERE articles_fts MATCH ?
       ORDER BY rank LIMIT ?`
    )
    .bind(match, limit)
    .all<Article>();
  return results;
}

export async function updateArticleContent(id: number, markdown: string): Promise<void> {
  const db = await d1();
  await db
    .prepare("UPDATE articles SET markdown = ?, status = 'fresh', updated_at = ? WHERE id = ?")
    .bind(markdown, nowIso(), id)
    .run();
}

export async function setArticleStatus(id: number, status: ArticleStatus): Promise<void> {
  const db = await d1();
  await db.prepare("UPDATE articles SET status = ? WHERE id = ?").bind(status, id).run();
}

export async function touchChecked(id: number): Promise<void> {
  const db = await d1();
  await db.prepare("UPDATE articles SET checked_at = ? WHERE id = ?").bind(nowIso(), id).run();
}

export async function articleExistsBySourceUrl(url: string): Promise<boolean> {
  const db = await d1();
  const row = await db
    .prepare("SELECT 1 AS one FROM articles WHERE source_url = ?")
    .bind(url)
    .first<{ one: number }>();
  return !!row;
}

export async function articleExistsByTitle(title: string): Promise<boolean> {
  const db = await d1();
  const row = await db
    .prepare("SELECT 1 AS one FROM articles WHERE title = ?")
    .bind(title)
    .first<{ one: number }>();
  return !!row;
}

// ------------------------------------------------------------------ drafts

export async function createDraft(
  articleId: number,
  proposedMarkdown: string,
  reason: string
): Promise<Draft> {
  const db = await d1();
  const res = await db
    .prepare(
      "INSERT INTO drafts (article_id, proposed_markdown, reason, status, created_at) VALUES (?, ?, ?, 'pending', ?)"
    )
    .bind(articleId, proposedMarkdown, reason, nowIso())
    .run();
  const row = await getDraftById(Number(res.meta.last_row_id));
  if (!row) throw new Error("createDraft: failed to read back inserted row");
  return row;
}

export async function getDraftById(id: number): Promise<Draft | undefined> {
  const db = await d1();
  const row = await db
    .prepare("SELECT * FROM drafts WHERE id = ?")
    .bind(id)
    .first<Draft>();
  return row ?? undefined;
}

export async function getDrafts(status?: DraftStatus): Promise<DraftWithArticle[]> {
  const db = await d1();
  const sql = `SELECT d.*, a.title AS article_title, a.markdown AS article_markdown
               FROM drafts d JOIN articles a ON a.id = d.article_id
               ${status ? "WHERE d.status = ?" : ""}
               ORDER BY d.created_at DESC`;
  const stmt = db.prepare(sql);
  const { results } = status
    ? await stmt.bind(status).all<DraftWithArticle>()
    : await stmt.all<DraftWithArticle>();
  return results;
}

/** Approve a draft: write the (optionally edited) markdown onto the article. */
export async function approveDraft(id: number, markdownOverride?: string): Promise<void> {
  const db = await d1();
  const d = await getDraftById(id);
  if (!d || d.status !== "pending") throw new Error("Draft not found or not pending");
  const finalMd = markdownOverride ?? d.proposed_markdown;
  const ts = nowIso();
  // D1 has no interactive transactions over the HTTP API surface used here;
  // batch() applies all statements atomically instead.
  await db.batch([
    db
      .prepare("UPDATE articles SET markdown = ?, status = 'fresh', updated_at = ? WHERE id = ?")
      .bind(finalMd, ts, d.article_id),
    db.prepare("UPDATE drafts SET status = 'approved' WHERE id = ?").bind(id),
  ]);
}

export async function rejectDraft(id: number): Promise<void> {
  const db = await d1();
  await db.prepare("UPDATE drafts SET status = 'rejected' WHERE id = ?").bind(id).run();
}

// ------------------------------------------------------------------ checks

export async function logCheck(
  articleId: number,
  changed: boolean,
  summary: string
): Promise<void> {
  const db = await d1();
  await db
    .prepare("INSERT INTO checks (article_id, changed, summary, created_at) VALUES (?, ?, ?, ?)")
    .bind(articleId, changed ? 1 : 0, summary, nowIso())
    .run();
}

export async function getLastCheckAt(): Promise<string | null> {
  const db = await d1();
  const row = await db
    .prepare("SELECT MAX(created_at) AS t FROM checks")
    .first<{ t: string | null }>();
  return row?.t ?? null;
}

export async function getStats(): Promise<Stats> {
  const db = await d1();
  const total = await db.prepare("SELECT COUNT(*) AS c FROM articles").first<{ c: number }>();
  const stale = await db
    .prepare("SELECT COUNT(*) AS c FROM articles WHERE status = 'stale'")
    .first<{ c: number }>();
  const pending = await db
    .prepare("SELECT COUNT(*) AS c FROM drafts WHERE status = 'pending'")
    .first<{ c: number }>();
  return {
    totalArticles: total?.c ?? 0,
    staleCount: stale?.c ?? 0,
    pendingDrafts: pending?.c ?? 0,
    lastCheckAt: await getLastCheckAt(),
  };
}

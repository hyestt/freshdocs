// lib/db.ts — SQLite persistence layer (better-sqlite3) with FTS5 search.
//
// LOCAL-DEV BACKEND. The database file lives at ./data/freshdocs.db
// (gitignored) or at the path given by DB_PATH. A single shared connection is
// cached on globalThis so Next.js dev-mode hot reloads don't open a second
// handle.
//
// On Cloudflare Workers this module is NOT used — lib/data.ts routes to
// lib/db-d1.ts instead (selected by DB_BACKEND=d1). The function names and
// shapes here are mirrored 1:1 by the D1 implementation (async versions).

import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
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

declare global {
  // eslint-disable-next-line no-var
  var __freshdocsDb: Database.Database | undefined;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS articles (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  markdown      TEXT NOT NULL,
  source_url    TEXT,
  status        TEXT NOT NULL DEFAULT 'fresh',
  updated_at    TEXT NOT NULL,
  checked_at    TEXT
);

CREATE TABLE IF NOT EXISTS drafts (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id       INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  proposed_markdown TEXT NOT NULL,
  reason           TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending',
  created_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS checks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id  INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  changed     INTEGER NOT NULL DEFAULT 0,
  summary     TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

-- Full-text index over help-center content (drives /docs search + chat retrieval).
CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts
  USING fts5(title, markdown, content='articles', content_rowid='id');

CREATE TRIGGER IF NOT EXISTS articles_fts_ai AFTER INSERT ON articles BEGIN
  INSERT INTO articles_fts(rowid, title, markdown)
  VALUES (new.id, new.title, new.markdown);
END;

CREATE TRIGGER IF NOT EXISTS articles_fts_ad AFTER DELETE ON articles BEGIN
  INSERT INTO articles_fts(articles_fts, rowid, title, markdown)
  VALUES ('delete', old.id, old.title, old.markdown);
END;

CREATE TRIGGER IF NOT EXISTS articles_fts_au AFTER UPDATE ON articles BEGIN
  INSERT INTO articles_fts(articles_fts, rowid, title, markdown)
  VALUES ('delete', old.id, old.title, old.markdown);
  INSERT INTO articles_fts(rowid, title, markdown)
  VALUES (new.id, new.title, new.markdown);
END;
`;

function dbPath(): string {
  return process.env.DB_PATH || path.join(process.cwd(), "data", "freshdocs.db");
}

/** Lazily open (and migrate) the shared database connection. */
export function getDb(): Database.Database {
  if (!globalThis.__freshdocsDb) {
    const p = dbPath();
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const db = new Database(p);
    db.pragma("journal_mode = WAL");
    db.exec(SCHEMA);
    globalThis.__freshdocsDb = db;
  }
  return globalThis.__freshdocsDb;
}

// ---------------------------------------------------------------- articles

export function uniqueSlug(base: string): string {
  const db = getDb();
  const exists = db.prepare("SELECT 1 FROM articles WHERE slug = ?");
  let slug = base;
  let i = 2;
  while (exists.get(slug)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

export function insertArticle(input: {
  title: string;
  markdown: string;
  sourceUrl?: string | null;
}): Article {
  const db = getDb();
  const slug = uniqueSlug(slugify(input.title));
  const info = db
    .prepare(
      "INSERT INTO articles (title, slug, markdown, source_url, status, updated_at) VALUES (?, ?, ?, ?, 'fresh', ?)"
    )
    .run(input.title, slug, input.markdown, input.sourceUrl ?? null, nowIso());
  const row = getArticleById(Number(info.lastInsertRowid));
  if (!row) throw new Error("insertArticle: failed to read back inserted row");
  return row;
}

export function getArticles(): Article[] {
  return getDb()
    .prepare("SELECT * FROM articles ORDER BY updated_at DESC")
    .all() as Article[];
}

export function getArticleById(id: number): Article | undefined {
  return getDb().prepare("SELECT * FROM articles WHERE id = ?").get(id) as
    | Article
    | undefined;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getDb().prepare("SELECT * FROM articles WHERE slug = ?").get(slug) as
    | Article
    | undefined;
}

export function searchArticles(q: string, limit = 20): Article[] {
  const match = sanitizeFts(q);
  if (!match) return [];
  return getDb()
    .prepare(
      `SELECT articles.* FROM articles_fts
         JOIN articles ON articles.id = articles_fts.rowid
       WHERE articles_fts MATCH ?
       ORDER BY rank LIMIT ?`
    )
    .all(match, limit) as Article[];
}

export function updateArticleContent(id: number, markdown: string): void {
  getDb()
    .prepare("UPDATE articles SET markdown = ?, status = 'fresh', updated_at = ? WHERE id = ?")
    .run(markdown, nowIso(), id);
}

export function setArticleStatus(id: number, status: ArticleStatus): void {
  getDb().prepare("UPDATE articles SET status = ? WHERE id = ?").run(status, id);
}

export function touchChecked(id: number): void {
  getDb().prepare("UPDATE articles SET checked_at = ? WHERE id = ?").run(nowIso(), id);
}

export function articleExistsBySourceUrl(url: string): boolean {
  return !!getDb().prepare("SELECT 1 FROM articles WHERE source_url = ?").get(url);
}

export function articleExistsByTitle(title: string): boolean {
  return !!getDb().prepare("SELECT 1 FROM articles WHERE title = ?").get(title);
}

// ------------------------------------------------------------------ drafts

export function createDraft(
  articleId: number,
  proposedMarkdown: string,
  reason: string
): Draft {
  const db = getDb();
  const info = db
    .prepare(
      "INSERT INTO drafts (article_id, proposed_markdown, reason, status, created_at) VALUES (?, ?, ?, 'pending', ?)"
    )
    .run(articleId, proposedMarkdown, reason, nowIso());
  const row = getDraftById(Number(info.lastInsertRowid));
  if (!row) throw new Error("createDraft: failed to read back inserted row");
  return row;
}

export function getDraftById(id: number): Draft | undefined {
  return getDb().prepare("SELECT * FROM drafts WHERE id = ?").get(id) as
    | Draft
    | undefined;
}

export function getDrafts(status?: DraftStatus): DraftWithArticle[] {
  const db = getDb();
  const sql = `SELECT d.*, a.title AS article_title, a.markdown AS article_markdown
               FROM drafts d JOIN articles a ON a.id = d.article_id
               ${status ? "WHERE d.status = ?" : ""}
               ORDER BY d.created_at DESC`;
  const rows = status ? db.prepare(sql).all(status) : db.prepare(sql).all();
  return rows as DraftWithArticle[];
}

/** Approve a draft: write the (optionally edited) markdown onto the article. */
export function approveDraft(id: number, markdownOverride?: string): void {
  const db = getDb();
  const d = getDraftById(id);
  if (!d || d.status !== "pending") throw new Error("Draft not found or not pending");
  const finalMd = markdownOverride ?? d.proposed_markdown;
  const tx = db.transaction(() => {
    db.prepare(
      "UPDATE articles SET markdown = ?, status = 'fresh', updated_at = ? WHERE id = ?"
    ).run(finalMd, nowIso(), d.article_id);
    db.prepare("UPDATE drafts SET status = 'approved' WHERE id = ?").run(id);
  });
  tx();
}

export function rejectDraft(id: number): void {
  getDb().prepare("UPDATE drafts SET status = 'rejected' WHERE id = ?").run(id);
}

// ------------------------------------------------------------------ checks

export function logCheck(articleId: number, changed: boolean, summary: string): void {
  getDb()
    .prepare("INSERT INTO checks (article_id, changed, summary, created_at) VALUES (?, ?, ?, ?)")
    .run(articleId, changed ? 1 : 0, summary, nowIso());
}

export function getLastCheckAt(): string | null {
  const row = getDb().prepare("SELECT MAX(created_at) AS t FROM checks").get() as {
    t: string | null;
  };
  return row?.t ?? null;
}

export function getStats(): Stats {
  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) AS c FROM articles").get() as { c: number }).c;
  const stale = (
    db.prepare("SELECT COUNT(*) AS c FROM articles WHERE status = 'stale'").get() as {
      c: number;
    }
  ).c;
  const pending = (
    db.prepare("SELECT COUNT(*) AS c FROM drafts WHERE status = 'pending'").get() as {
      c: number;
    }
  ).c;
  return { totalArticles: total, staleCount: stale, pendingDrafts: pending, lastCheckAt: getLastCheckAt() };
}

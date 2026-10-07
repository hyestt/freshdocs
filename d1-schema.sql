-- d1-schema.sql — FreshDocs schema for Cloudflare D1.
--
-- Apply with:
--   wrangler d1 execute freshdocs --file=d1-schema.sql
-- (add --local to target the local D1 dev database instead of remote)
--
-- Mirrors the SCHEMA in lib/db.ts 1:1. D1 is SQLite under the hood, so the
-- FTS5 virtual table and its sync triggers work unchanged.

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

# FreshDocs — the help center that never goes out of date

A Ferndesk-style AI help-center SaaS in a single Next.js app:

- **Ingest** — crawl a docs site (same-origin, up to 30 pages) or paste Markdown.
- **Audit** — re-fetch every article's source page, diff it, and let an AI judge
  whether the article went stale. Stale articles become **pending drafts**.
- **Review** — approve, edit, or reject each draft from a side-by-side diff UI.
  Nothing publishes without a human.
- **Answer** — a public help center (`/docs`) with full-text search, plus an
  embeddable chat widget (`/api/widget.js` → `POST /api/chat`) that answers
  from your articles with citations.

No external services are required. Everything works **without an LLM key**:
staleness checks fall back to a line-diff heuristic and chat falls back to
extractive snippets.

## Quickstart

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD (and LLM_API_KEY if you have one)
npm run dev                  # → http://localhost:3000
```

Then:

1. Open **http://localhost:3000/admin** and sign in with your `ADMIN_PASSWORD`.
2. Click **“Seed demo data”** to get 4 realistic help articles.
3. Crawl a docs URL (or paste Markdown) to add your own content.
4. Hit **“Check for updates now”** to run the AI audit.
5. Visit **/docs** for the public help center and **/demo** for the chat widget.

The SQLite database is created automatically at `./data/freshdocs.db`
(gitignored; override with `DB_PATH`).

## Environment variables

| Variable         | Required | Default                     | What it does                                                            |
| ---------------- | -------- | --------------------------- | ----------------------------------------------------------------------- |
| `ADMIN_PASSWORD` | yes      | `admin`                     | Password for `/admin`. `POST /api/login` sets a signed cookie.           |
| `DB_PATH`        | no       | `./data/freshdocs.db`       | Where the SQLite file lives.                                            |
| `LLM_API_KEY`    | no       | —                           | API key for the chat-completions endpoint. Unset = demo/heuristic mode. |
| `LLM_BASE_URL`   | no       | `https://api.openai.com/v1` | Any OpenAI-compatible endpoint (Ollama, OpenRouter, etc.).              |
| `LLM_MODEL`      | no       | `gpt-4o-mini`               | Model name sent to the endpoint.                                        |

## Architecture

```
                        ┌──────────────────────────────┐
                        │            Browser           │
                        │  / (landing)  /docs  /demo   │
                        │  /admin (cookie-gated)       │
                        │  widget.js bubble ─┐         │
                        └────────────────────┼─────────┘
                                             │ fetch
                        ┌────────────────────┼─────────┐
                        │   Next.js App Router (node)  │
                        │                              │
  /api/ingest ──► crawlDocs() ──► articles table       │
  /api/check  ──► fetchPage() ──► diffLines() ──► judgeStaleness() ──► drafts (pending)
  /api/chat   ──► FTS5 search ──► answerQuestion() ──► {answer, citations}
  /api/drafts ──► approve / reject ──► articles updated
  /api/widget.js ──► embeddable chat script            │
                        └────────────────────┬─────────┘
                                             │
                        ┌────────────────────┼─────────┐
                        │  SQLite (better-sqlite3)     │
                        │  articles · drafts · checks  │
                        │  articles_fts (FTS5 index)   │
                        └──────────────────────────────┘

  lib/llm.ts ──► plain fetch() to OpenAI-compatible API,
                 graceful fallback when LLM_API_KEY is unset
```

## API reference

| Route                        | Method | Auth  | Purpose                                            |
| ---------------------------- | ------ | ----- | -------------------------------------------------- |
| `/api/login`                 | POST   | —     | `{password}` → sets admin cookie                   |
| `/api/logout`                | POST   | —     | clears admin cookie                                |
| `/api/ingest`                | POST   | admin | `{url}` crawl · `{title, markdown}` add article    |
| `/api/check`                 | POST   | admin | audit all articles with a `source_url`             |
| `/api/articles`              | GET    | —     | list articles · `?q=` full-text search             |
| `/api/articles/[id]`         | GET    | —     | full article                                       |
| `/api/drafts`                | GET    | admin | pending drafts with line diffs (`?status=` filter) |
| `/api/drafts/[id]/approve`   | POST   | admin | publish draft · optional `{markdown}` override    |
| `/api/drafts/[id]/reject`    | POST   | admin | discard draft                                      |
| `/api/stats`                 | GET    | admin | dashboard numbers                                  |
| `/api/seed`                  | POST   | admin | insert 4 sample articles                           |
| `/api/chat`                  | POST   | —     | `{message}` → `{answer, citations}`                |
| `/api/widget.js`             | GET    | —     | embeddable chat-widget script                      |

Admin auth: `ADMIN_PASSWORD` env var; `POST /api/login` sets an HMAC-signed
HttpOnly cookie (`fd_admin`). The `/admin` page redirects to `/admin/login`
when the cookie is missing/invalid, and every mutating API returns 401.

## Roadmap

- [ ] Scheduled audits (cron) instead of the manual button
- [ ] Per-article audit cadence + Slack/email notifications on new drafts
- [ ] Multi-workspace support with per-workspace API keys
- [ ] Analytics: which articles the chat answers from, deflection rate
- [ ] Richer Markdown (tables, callouts) in the article renderer
- [ ] Playwright-based crawling for JS-heavy docs sites

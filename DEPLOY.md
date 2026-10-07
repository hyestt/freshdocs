# DEPLOY.md — Deploying FreshDocs to Cloudflare Workers

FreshDocs runs on Cloudflare Workers via
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) (Next.js 16
supported). The database is Cloudflare **D1** (SQLite-compatible, FTS5
included); the same codebase still runs locally with better-sqlite3 for
`npm run dev`.

Result: a permanent URL like `https://freshdocs.<your-subdomain>.workers.dev`
(or your own domain via `wrangler domains` / the dashboard).

---

## 0. Prerequisites

- A Cloudflare account (free tier is fine)
- Node.js 20+ and this repo's dependencies installed (`npm install`)
- `wrangler` — already a devDependency here (`npx wrangler ...`)

### Auth: `wrangler login` or an API token

Either run `npx wrangler login` (browser OAuth), **or** create an API token at
https://dash.cloudflare.com/profile/api-tokens and export it:

```bash
export CLOUDFLARE_API_TOKEN="<token>"
```

**Required token permissions** (least privilege):

| Scope | Permission | Why |
|---|---|---|
| Account — Workers Scripts | Edit | `wrangler deploy` |
| Account — D1 | Edit | `wrangler d1 create` / `execute` |

The easiest path is the **"Edit Cloudflare Workers"** token template, which
includes both. (Zone permissions are NOT needed — the app uses `workers.dev`.)

---

## 1. Create the D1 database

```bash
npx wrangler d1 create freshdocs
```

Copy the printed `database_id` into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "freshdocs"
database_id = "PASTE_THE_REAL_ID_HERE"
```

## 2. Apply the schema

```bash
npx wrangler d1 execute freshdocs --file=d1-schema.sql
```

This creates `articles`, `drafts`, `checks`, the `articles_fts` FTS5 index and
its sync triggers — the exact mirror of the local `lib/db.ts` schema.
(Use `--remote` explicitly if you ever want to be sure you're not hitting a
local dev database; remote is the default for `d1 execute`.)

## 3. Set secrets

```bash
npx wrangler secret put ADMIN_PASSWORD   # required — the /admin login password
npx wrangler secret put LLM_API_KEY      # optional — without it the app runs
                                         # in heuristic/extractive demo mode
```

Non-secret config already lives in `wrangler.toml` `[vars]`:
`DB_BACKEND=d1`, `LLM_BASE_URL`, `LLM_MODEL`.

## 4. Build the Worker bundle

```bash
npm run cf:build
# = CF_WORKERS_BUILD=1 npx opennextjs-cloudflare build
```

`CF_WORKERS_BUILD=1` swaps the `better-sqlite3` native module for an empty
shim (workerd can't load native bindings; the D1 backend never touches it).
The plain `npm run build` / `npm run dev` paths are unaffected.

## 5. Deploy

```bash
npm run cf:deploy
# = npx wrangler deploy
```

First deploy prints your URL, e.g.:

```
https://freshdocs.<your-account>.workers.dev
```

Every later deploy is just steps 4–5 again. **No rebuild of D1 needed** —
schema changes only when `d1-schema.sql` changes.

### Validate without deploying

```bash
npx wrangler deploy --dry-run   # validates bindings, no credentials needed
```

---

## Local development (unchanged)

```bash
cp .env.example .env.local   # set ADMIN_PASSWORD (and LLM_API_KEY if you have one)
npm run dev                  # → http://localhost:3000, better-sqlite3 backend
```

`DB_BACKEND` unset (or anything but `d1`) = local SQLite file at
`./data/freshdocs.db`. The Workers/D1 code path is only compiled in; it
activates solely via `DB_BACKEND=d1`.

To smoke-test the Worker bundle locally against a **local** D1:

```bash
npx wrangler d1 execute freshdocs --local --file=d1-schema.sql
echo 'ADMIN_PASSWORD=devpassword' > .dev.vars   # gitignored
npx wrangler dev --local --port 8787
```

---

## Architecture notes

- `lib/data.ts` is the single import surface for all routes/pages. It picks
  the backend per call: `DB_BACKEND=d1` → `lib/db-d1.ts` (async, via
  `getCloudflareContext().env.DB`), else `lib/db.ts` (sync better-sqlite3).
- `lib/auth.ts` uses WebCrypto only — identical HMAC-SHA256 session tokens in
  Node and Workers, so login cookies survive the move.
- `lib/llm.ts` / `lib/crawl.ts` are plain `fetch()` + pure JS —
  Workers-safe. Note: `crawl.ts` imports from **`cheerio/slim`** (not
  `cheerio`): the full entry pulls in `undici`, which references `MessagePort`
  at module load and crashes workerd. The slim entry is undici-free and its
  `load()` is identical.
- `approveDraft` uses D1 `batch()` (atomic) instead of better-sqlite3's
  interactive transaction, which D1's HTTP API doesn't offer.
- The OpenNext default cache wires three Durable Objects
  (`NEXT_TAG_CACHE_DO_SHARDED`, `NEXT_CACHE_DO_QUEUE`, `NEXT_CACHE_DO_PURGE`);
  they are declared in `wrangler.toml` because `wrangler deploy` requires every
  exported DO class to be configured. The app is fully dynamic (`force-dynamic`
  everywhere), so they sit idle.

## Known gaps / risks

- **No cron yet.** Audits run via the "Check for updates now" button (or
  `POST /api/check`). For scheduled audits, add a [Workers Cron Trigger] and
  call the check logic on the `scheduled` event (not yet implemented).
- **Single-tenant.** One shared article set + one admin password, same as the
  local version.
- **D1 limits.** Free tier: 5 GB storage, generous reads/writes for a help
  center; crawls of very large docs sites are bounded at 30 pages per ingest.
- **No `wrangler login` in CI?** Use `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`
  env vars instead.

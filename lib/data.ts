// lib/data.ts — backend-selecting facade over the FreshDocs data layer.
//
// ALL functions here are async. The backend is chosen per call:
//   DB_BACKEND=d1  → Cloudflare D1 (lib/db-d1.ts) — the Workers deployment.
//   anything else  → local better-sqlite3 (lib/db.ts) — `npm run dev`.
//
// On Workers, DB_BACKEND can also come from a wrangler [vars] entry, which
// getCloudflareContext() exposes (process.env is not reliably populated
// there), so both sources are checked.

import * as local from "./db";
import * as d1 from "./db-d1";
import {
  nowIso,
  slugify,
  type Article,
  type ArticleStatus,
  type Draft,
  type DraftStatus,
  type DraftWithArticle,
  type Stats,
} from "./db-common";

export type { Article, ArticleStatus, Draft, DraftStatus, DraftWithArticle, Stats };
export { nowIso, slugify };

let cachedUseD1: boolean | undefined;

/** Resolve which backend to use (cached after the first call). */
async function useD1(): Promise<boolean> {
  if (cachedUseD1 !== undefined) return cachedUseD1;

  const fromProcess =
    typeof process !== "undefined" ? process.env.DB_BACKEND : undefined;
  if (fromProcess !== undefined) {
    cachedUseD1 = fromProcess === "d1";
    return cachedUseD1;
  }

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext();
    cachedUseD1 = (env as Record<string, unknown>).DB_BACKEND === "d1";
  } catch {
    cachedUseD1 = false; // not on Cloudflare (e.g. plain `next dev`)
  }
  return cachedUseD1;
}

/** Route one function to the active backend (async-ifying the sync local one). */
function pick<A extends unknown[], R>(
  localFn: (...args: A) => R,
  d1Fn: (...args: A) => Promise<R>
): (...args: A) => Promise<R> {
  return async (...args: A) => ((await useD1()) ? d1Fn(...args) : localFn(...args));
}

export const getArticles = pick(local.getArticles, d1.getArticles);
export const getArticleById = pick(local.getArticleById, d1.getArticleById);
export const getArticleBySlug = pick(local.getArticleBySlug, d1.getArticleBySlug);
export const searchArticles = pick(local.searchArticles, d1.searchArticles);
export const insertArticle = pick(local.insertArticle, d1.insertArticle);
export const updateArticleContent = pick(local.updateArticleContent, d1.updateArticleContent);
export const setArticleStatus = pick(local.setArticleStatus, d1.setArticleStatus);
export const touchChecked = pick(local.touchChecked, d1.touchChecked);
export const articleExistsBySourceUrl = pick(
  local.articleExistsBySourceUrl,
  d1.articleExistsBySourceUrl
);
export const articleExistsByTitle = pick(local.articleExistsByTitle, d1.articleExistsByTitle);
export const uniqueSlug = pick(local.uniqueSlug, d1.uniqueSlug);
export const createDraft = pick(local.createDraft, d1.createDraft);
export const getDraftById = pick(local.getDraftById, d1.getDraftById);
export const getDrafts = pick(local.getDrafts, d1.getDrafts);
export const approveDraft = pick(local.approveDraft, d1.approveDraft);
export const rejectDraft = pick(local.rejectDraft, d1.rejectDraft);
export const logCheck = pick(local.logCheck, d1.logCheck);
export const getLastCheckAt = pick(local.getLastCheckAt, d1.getLastCheckAt);
export const getStats = pick(local.getStats, d1.getStats);

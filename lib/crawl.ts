// lib/crawl.ts — same-origin docs crawler.
//
// fetch() + cheerio only (no headless browser). Extracts the main content of
// each page as Markdown-ish text and follows same-origin links up to a cap.
//
// NOTE: imports from "cheerio/slim" (not "cheerio") — the slim entrypoint
// excludes cheerio's undici-based `fromURL` helper, which crashes at module
// load in Cloudflare Workers (undici references MessagePort at import time).
// `load` itself is pure HTML parsing and is identical in both entries.

import { load } from "cheerio/slim";

export interface CrawledPage {
  url: string;
  title: string;
  markdown: string;
}

const BLOCK = new Set(["h1", "h2", "h3", "h4", "p", "li", "pre", "blockquote"]);

function extractMarkdown(html: string): { title: string; markdown: string; links: string[] } {
  const $ = load(html);
  $("script, style, noscript, svg, nav, header, footer, aside, form, iframe").remove();

  const title = ($("title").first().text() || $("h1").first().text() || "Untitled")
    .trim()
    .slice(0, 200);

  let root = $("main, article, [role='main']").first();
  if (!root.length) root = $("body");
  const stop = root[0];

  const lines: string[] = [];
  root.find("h1, h2, h3, h4, p, li, pre, blockquote").each((_, el) => {
    const tag = el.tagName.toLowerCase();
    // Skip elements nested inside another block element (avoids double counting,
    // e.g. a <p> inside an <li>).
    let nested = false;
    let par = el.parent;
    while (par && par !== stop) {
      const t = "tagName" in par ? (par.tagName as string).toLowerCase() : "";
      if (t && BLOCK.has(t)) {
        nested = true;
        break;
      }
      par = par.parent;
    }
    if (nested) return;

    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text || text.length > 2000) return;
    if (tag === "h1") lines.push(`# ${text}`);
    else if (tag === "h2") lines.push(`## ${text}`);
    else if (tag === "h3" || tag === "h4") lines.push(`### ${text}`);
    else if (tag === "li") lines.push(`- ${text}`);
    else if (tag === "pre") lines.push("```\n" + text + "\n```");
    else if (tag === "blockquote") lines.push(`> ${text}`);
    else lines.push(text);
  });

  // Drop consecutive duplicate blocks (common in nav-adjacent markup).
  const deduped = lines.filter((l, i) => i === 0 || l !== lines[i - 1]);

  const links: string[] = [];
  root.find("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href) links.push(href);
  });

  return { title, markdown: deduped.join("\n\n").slice(0, 60_000), links };
}

export function normalizeUrl(href: string, base: string): string | null {
  try {
    const u = new URL(href, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: { "User-Agent": "FreshDocsBot/1.0" },
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (ct && !ct.includes("html") && !ct.includes("text")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Fetch and extract a single page (used by the staleness checker). */
export async function fetchPage(url: string): Promise<CrawledPage | null> {
  const html = await fetchHtml(url);
  if (!html) return null;
  const { title, markdown } = extractMarkdown(html);
  return { url, title, markdown };
}

/**
 * Breadth-first crawl starting at startUrl, following only same-origin links,
 * stopping after maxPages pages with meaningful content.
 */
export async function crawlDocs(startUrl: string, maxPages = 30): Promise<CrawledPage[]> {
  const origin = new URL(startUrl).origin;
  const seen = new Set<string>([startUrl]);
  const queue: string[] = [startUrl];
  const pages: CrawledPage[] = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const url = queue.shift()!;
    const html = await fetchHtml(url);
    if (!html) continue;
    const { title, markdown, links } = extractMarkdown(html);
    if (markdown.trim().length > 100) pages.push({ url, title, markdown });

    for (const href of links) {
      const abs = normalizeUrl(href, url);
      if (!abs || seen.has(abs)) continue;
      if (new URL(abs).origin !== origin) continue; // same-origin only
      seen.add(abs);
      queue.push(abs);
    }
  }
  return pages;
}

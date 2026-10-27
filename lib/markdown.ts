// lib/markdown.ts — minimal Markdown -> HTML renderer.
//
// Supports headings, bullet lists, blockquotes, fenced code blocks, inline
// code, bold, italic, and links. Output is escaped first, so it's safe to
// inject with dangerouslySetInnerHTML.

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(md: string): string {
  let s = esc(md);
  s = s.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) => {
    const safe = /^(https?:|#|\/)/.test(url) ? url : "#";
    return `<a href="${esc(safe)}">${text}</a>`;
  });
  return s;
}

const FENCE = "FRESHDOCS-FENCE-";

function makeHeadingId(raw: string, seen: Map<string, number>): string {
  const base =
    raw
      .replace(/[*_`[\]]/g, "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "section";
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

export interface MarkdownHeading {
  level: number;
  text: string;
  id: string;
}

export function getMarkdownHeadings(md: string): MarkdownHeading[] {
  const seen = new Map<string, number>();
  const headings: MarkdownHeading[] = [];

  for (const line of md.split("\n")) {
    const match = line.match(/^(#{1,4})\s+(.*)$/);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].replace(/[*_`[\]]/g, "");
    const id = makeHeadingId(match[2], seen);
    if (level >= 2) headings.push({ level, text, id });
  }

  return headings;
}

export function renderMarkdown(md: string): string {
  // Pull out fenced code blocks first so their contents aren't reformatted.
  const fences: string[] = [];
  const src = md.replace(/```[^\n]*\n([\s\S]*?)```/g, (_m, code: string) => {
    fences.push(`<pre><code>${esc(code.replace(/\n$/, ""))}</code></pre>`);
    return `${FENCE}${fences.length - 1}~`;
  });

  const out: string[] = [];
  const lines = src.split("\n");
  const headings = new Map<string, number>();
  let inList = false;
  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const line of lines) {
    if (line.startsWith(FENCE)) {
      closeList();
      const idx = parseInt(line.slice(FENCE.length, -1), 10); // trailing "~" stripped
      if (!Number.isNaN(idx) && fences[idx]) out.push(fences[idx]);
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeList();
      const lvl = h[1].length;
      const id = makeHeadingId(h[2], headings);
      out.push(`<h${lvl} id="${id}">${inline(h[2])}</h${lvl}>`);
      continue;
    }
    const li = line.match(/^\s*[-*]\s+(.*)$/);
    if (li) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(li[1])}</li>`);
      continue;
    }
    const q = line.match(/^>\s?(.*)$/);
    if (q) {
      closeList();
      out.push(`<blockquote>${inline(q[1])}</blockquote>`);
      continue;
    }
    if (/^\s*$/.test(line)) {
      closeList();
      continue;
    }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join("\n");
}

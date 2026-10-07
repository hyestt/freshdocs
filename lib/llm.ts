// lib/llm.ts — all LLM access goes through here.
//
// Uses plain fetch() against any OpenAI-compatible chat-completions endpoint
// (LLM_BASE_URL / LLM_MODEL / LLM_API_KEY). Every high-level helper has a
// graceful fallback so the whole product demos WITHOUT an API key.

export function llmConfigured(): boolean {
  return !!process.env.LLM_API_KEY;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function chatCompletion(
  system: string,
  user: string,
  json = false
): Promise<string | null> {
  const key = process.env.LLM_API_KEY;
  if (!key) return null;
  const base = (process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: system } satisfies ChatMessage,
          { role: "user", content: user } satisfies ChatMessage,
        ],
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      console.error(`[llm] HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return null;
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : null;
  } catch (err) {
    console.error("[llm] request failed:", err);
    return null;
  }
}

// ------------------------------------------------------- staleness judging

export interface StalenessJudgment {
  stale: boolean;
  reason: string;
  proposedMarkdown: string;
}

const AUDIT_SYSTEM = `You are a meticulous technical-documentation auditor for a help center.
You are given the CURRENT published help article and the NEW source text it was
originally written from (e.g. a product docs page that changed since the article
was last reviewed).

Decide whether the article is now STALE — i.e. whether a reader following the
article could be misled, or would miss important new behavior, options, or steps.
Cosmetic rewording alone is NOT stale.

Reply with a single JSON object and nothing else:
{
  "stale": boolean,
  "reason": "one or two sentences explaining the verdict, naming what changed",
  "proposed_markdown": "the full updated help article in Markdown (same friendly tone and structure as the original, incorporating the new information). Empty string if not stale."
}`;

export async function judgeStaleness(
  title: string,
  oldMarkdown: string,
  newText: string,
  ratio: number
): Promise<StalenessJudgment> {
  const heuristic = (stale: boolean, why: string): StalenessJudgment => ({
    stale,
    reason: stale
      ? `Heuristic (no LLM key): ${Math.round(ratio * 100)}% of lines changed on the source page. ${why}`
      : `Heuristic (no LLM key): only ${Math.round(ratio * 100)}% of lines changed — treated as cosmetic.`,
    proposedMarkdown: stale ? newText : oldMarkdown,
  });

  if (!llmConfigured()) {
    // Without a key we can't rewrite prose well, so only flag big changes.
    return heuristic(ratio > 0.25, "Review the diff in the admin panel.");
  }

  const user = `Article title: ${title}

--- CURRENT HELP ARTICLE ---
${oldMarkdown.slice(0, 12_000)}

--- NEW SOURCE TEXT (${Math.round(ratio * 100)}% of lines changed) ---
${newText.slice(0, 12_000)}`;

  const raw = await chatCompletion(AUDIT_SYSTEM, user, true);
  if (!raw) return heuristic(ratio > 0.25, "The LLM call failed; review the diff manually.");
  try {
    const parsed = JSON.parse(raw) as {
      stale?: unknown;
      reason?: unknown;
      proposed_markdown?: unknown;
    };
    return {
      stale: parsed.stale === true,
      reason:
        typeof parsed.reason === "string" && parsed.reason.length > 0
          ? parsed.reason
          : "The source page changed materially.",
      proposedMarkdown:
        typeof parsed.proposed_markdown === "string" && parsed.proposed_markdown.length > 0
          ? parsed.proposed_markdown
          : newText,
    };
  } catch {
    return heuristic(ratio > 0.25, "The LLM returned unparseable output; review the diff manually.");
  }
}

// ------------------------------------------------------------- chat answers

export interface Citation {
  index: number;
  title: string;
  slug: string;
  articleId: number;
}

export interface CitedAnswer {
  answer: string;
  citations: Citation[];
}

export interface ChatDoc {
  id: number;
  title: string;
  slug: string;
  markdown: string;
}

const CHAT_SYSTEM = `You are the friendly support assistant for a product help center.
Answer the user's question using ONLY the help articles provided below.
- Be concise and concrete; include exact steps, names, and numbers from the articles.
- Cite every factual claim with the article number like [1], [2].
- If the articles don't contain the answer, say so plainly and suggest what to ask instead.
- Never invent features, prices, or URLs that aren't in the articles.`;

export async function answerQuestion(
  question: string,
  docs: ChatDoc[]
): Promise<CitedAnswer> {
  const citations: Citation[] = docs.map((d, i) => ({
    index: i + 1,
    title: d.title,
    slug: d.slug,
    articleId: d.id,
  }));
  if (docs.length === 0) {
    return {
      answer:
        "I couldn't find anything about that in the help center yet. Try asking about getting started, billing, or integrations — or check back once more articles are added.",
      citations: [],
    };
  }
  if (!llmConfigured()) {
    return { answer: extractiveAnswer(question, docs), citations };
  }
  const context = docs
    .map((d, i) => `[${i + 1}] ${d.title}\n${d.markdown.slice(0, 4000)}`)
    .join("\n\n---\n\n");
  const out = await chatCompletion(CHAT_SYSTEM, `Question: ${question}\n\nHelp articles:\n${context}`);
  return {
    answer: out ?? extractiveAnswer(question, docs),
    citations,
  };
}

/** Keyword-based fallback: return the most relevant sentences from the docs. */
function extractiveAnswer(question: string, docs: ChatDoc[]): string {
  const terms = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
  const termSet = new Set(terms);

  const scored: { text: string; score: number; docIdx: number }[] = [];
  docs.forEach((d, docIdx) => {
    const sentences = d.markdown
      .replace(/[#>*`]/g, " ")
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter((s) => s.length > 25 && s.length < 400);
    for (const s of sentences) {
      const words = s.toLowerCase().split(/[^a-z0-9]+/);
      let score = 0;
      for (const w of words) if (termSet.has(w)) score += w.length > 5 ? 2 : 1;
      if (score > 0) scored.push({ text: s, score, docIdx });
    }
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 4);
  if (top.length === 0) {
    return `I found ${docs.length} related article${docs.length === 1 ? "" : "s"} but nothing matching those exact words. The closest matches are: ${docs
      .map((d, i) => `[${i + 1}] ${d.title}`)
      .join(", ")}.`;
  }
  const lines = top.map((t) => `• ${t.text} [${t.docIdx + 1}]`);
  return (
    `Here's what the help center says (demo mode — no LLM key configured):\n\n` +
    lines.join("\n")
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BrandMark } from "../components/Brand";

// ------------------------------------------------------------------ types

interface Stats {
  totalArticles: number;
  staleCount: number;
  pendingDrafts: number;
  lastCheckAt: string | null;
  llm: "llm" | "heuristic";
}

interface ArticleRow {
  id: number;
  title: string;
  slug: string;
  status: "fresh" | "stale";
  source_url: string | null;
  updated_at: string;
  checked_at: string | null;
}

interface DiffOp {
  type: "same" | "add" | "del";
  text: string;
}

interface DraftItem {
  id: number;
  article_id: number;
  article_title: string;
  status: string;
  reason: string;
  created_at: string;
  proposed_markdown: string;
  ops: DiffOp[];
}

// ------------------------------------------------------------------ helpers

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function StatusBadge({ status }: { status: string }) {
  if (status === "stale") {
    return (
      <span className="rounded-full bg-[#fff1c2] px-2.5 py-1 text-[11px] font-semibold text-[#725a16]">
        Stale
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[#e2f3ea] px-2.5 py-1 text-[11px] font-semibold text-[#126b52]">
      Fresh
    </span>
  );
}

/** One pane of the side-by-side diff. side="old" shows del+same, "new" shows add+same. */
function DiffPane({ ops, side }: { ops: DiffOp[]; side: "old" | "new" }) {
  const rows = ops.filter((o) =>
    side === "old" ? o.type !== "add" : o.type !== "del"
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-[#d8e0da] bg-white">
      <div className="border-b border-[#e1e6e2] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7b8881]">
        {side === "old" ? "Current article" : "Proposed update"}
      </div>
      <pre className="max-h-96 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
        {rows.map((o, i) => (
          <div
            key={i}
            className={
              o.type === "del"
                ? "bg-[#fff0ed] text-[#873a2e]"
                : o.type === "add"
                  ? "bg-[#e7f5ed] text-[#175a44]"
                  : "text-[#69776f]"
            }
          >
            {o.text || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}

// ------------------------------------------------------------------ page

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [checking, setChecking] = useState(false);
  const [checkMsg, setCheckMsg] = useState<string | null>(null);
  const [ingestUrl, setIngestUrl] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestMsg, setIngestMsg] = useState<string | null>(null);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteMd, setPasteMd] = useState("");
  const [pasting, setPasting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [editing, setEditing] = useState<Record<number, string>>({});
  const [busyDraft, setBusyDraft] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [s, a, d] = await Promise.all([
        fetch("/api/stats").then((r) => r.json()),
        fetch("/api/articles").then((r) => r.json()),
        fetch("/api/drafts").then((r) => r.json()),
      ]);
      setStats(s);
      setArticles(a.articles ?? []);
      setDrafts(d.drafts ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function runCheck() {
    setChecking(true);
    setCheckMsg(null);
    try {
      const res = await fetch("/api/check", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Check failed.");
      setCheckMsg(
        `Checked ${data.checked} article(s) — ${data.stale} stale draft(s) created (mode: ${data.llm}).`
      );
      await refresh();
    } catch (err) {
      setCheckMsg(`Error: ${(err as Error).message}`);
    } finally {
      setChecking(false);
    }
  }

  async function runSeed() {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Seed failed.");
      await refresh();
    } finally {
      setSeeding(false);
    }
  }

  async function runCrawl() {
    if (!ingestUrl.trim()) return;
    setIngesting(true);
    setIngestMsg(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ingestUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Crawl failed.");
      setIngestMsg(`Crawled ${data.crawled} page(s): ${data.added} added, ${data.skipped} already existed.`);
      setIngestUrl("");
      await refresh();
    } catch (err) {
      setIngestMsg(`Error: ${(err as Error).message}`);
    } finally {
      setIngesting(false);
    }
  }

  async function runPaste() {
    if (!pasteMd.trim()) return;
    setPasting(true);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: pasteTitle.trim() || undefined, markdown: pasteMd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ingest failed.");
      setPasteTitle("");
      setPasteMd("");
      await refresh();
    } finally {
      setPasting(false);
    }
  }

  async function approveDraft(id: number) {
    setBusyDraft(id);
    try {
      const edited = editing[id];
      const res = await fetch(`/api/drafts/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edited !== undefined ? { markdown: edited } : {}),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Approve failed.");
      setEditing((e) => {
        const next = { ...e };
        delete next[id];
        return next;
      });
      await refresh();
    } finally {
      setBusyDraft(null);
    }
  }

  async function rejectDraft(id: number) {
    if (!confirm("Reject this draft? The article stays as-is.")) return;
    setBusyDraft(id);
    try {
      await fetch(`/api/drafts/${id}/reject`, { method: "POST" });
      await refresh();
    } finally {
      setBusyDraft(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f3]">
        <p className="text-sm text-[#69776f]">Loading workspace…</p>
      </div>
    );
  }

  const cards: { label: string; value: string | number; hint: string }[] = [
    { label: "Articles", value: stats?.totalArticles ?? 0, hint: "in the help center" },
    { label: "Stale", value: stats?.staleCount ?? 0, hint: "need attention" },
    { label: "Pending drafts", value: stats?.pendingDrafts ?? 0, hint: "awaiting review" },
    {
      label: "Last audit",
      value: stats?.lastCheckAt ? new Date(stats.lastCheckAt).toLocaleDateString() : "never",
      hint: `mode: ${stats?.llm ?? "?"}`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f3] text-[#14231d]">
      {/* header */}
      <header className="border-b border-[#dfe5df] bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <span className="block text-sm font-semibold tracking-[-0.02em]">FreshDocs</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9690]">Workspace</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-[#d8e0da] px-4 py-2 text-xs font-semibold text-[#5d6c64] hover:border-[#b7c9be] hover:text-[#126b52]"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-5 py-10 sm:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#126b52]">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Documentation workspace</h1>
          <p className="mt-2 text-sm text-[#69776f]">Monitor content health and review suggested updates.</p>
        </div>
        {/* stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-[#d8e0da] bg-white p-5 shadow-[0_8px_24px_rgba(36,61,50,0.04)]"
            >
              <p className="text-xs font-medium text-[#7b8881]">{c.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{c.value}</p>
              <p className="mt-1 text-xs text-[#9aa59f]">{c.hint}</p>
            </div>
          ))}
        </section>

        {/* actions */}
        <section className="flex flex-col gap-5 rounded-2xl border border-[#cddbd3] bg-[#eaf4ee] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Audit your help center</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#5d6c64]">
            Re-fetch every article's source page, diff it, and let the AI draft updates for
            anything that went stale.
          </p>
          {checkMsg && <p className="mt-3 text-sm font-medium text-[#315e4d]">{checkMsg}</p>}
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <button
              onClick={runCheck}
              disabled={checking}
              className="rounded-full bg-[#126b52] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0e5b45] disabled:opacity-50"
            >
              {checking ? "Auditing…" : "Check for updates now"}
            </button>
            <button
              onClick={runSeed}
              disabled={seeding}
              className="rounded-full border border-[#b8cbc0] bg-white px-5 py-2.5 text-sm font-semibold text-[#315e4d] hover:border-[#8eaa9b] disabled:opacity-50"
            >
              {seeding ? "Seeding…" : "Seed demo data"}
            </button>
          </div>
        </section>

        {/* ingest */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[#d8e0da] bg-white p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a9690]">From a URL</p>
            <h2 className="mt-2 text-lg font-semibold">Crawl a docs site</h2>
            <p className="mt-1 text-sm text-[#69776f]">
              Same-origin crawl, up to 30 pages.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                value={ingestUrl}
                onChange={(e) => setIngestUrl(e.target.value)}
                placeholder="https://docs.example.com"
                className="min-w-0 flex-1 rounded-xl border border-[#cbd6ce] bg-white px-3 py-2.5 text-sm placeholder:text-[#9aa59f] focus:border-[#126b52] focus:outline-none"
              />
              <button
                onClick={runCrawl}
                disabled={ingesting || !ingestUrl.trim()}
                className="rounded-xl bg-[#14231d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#263b32] disabled:opacity-50"
              >
                {ingesting ? "Crawling…" : "Crawl"}
              </button>
            </div>
            {ingestMsg && <p className="mt-3 text-sm text-[#5d6c64]">{ingestMsg}</p>}
          </div>
          <div className="rounded-2xl border border-[#d8e0da] bg-white p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a9690]">From Markdown</p>
            <h2 className="mt-2 text-lg font-semibold">Paste an article</h2>
            <p className="mt-1 text-sm text-[#69776f]">
              Markdown is rendered in the help center.
            </p>
            <input
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
              placeholder="Article title"
              className="mt-4 w-full rounded-xl border border-[#cbd6ce] px-3 py-2.5 text-sm placeholder:text-[#9aa59f] focus:border-[#126b52] focus:outline-none"
            />
            <textarea
              value={pasteMd}
              onChange={(e) => setPasteMd(e.target.value)}
              placeholder="# Title&#10;&#10;Write Markdown here…"
              rows={4}
              className="mt-2 w-full rounded-xl border border-[#cbd6ce] px-3 py-2.5 font-mono text-sm placeholder:text-[#9aa59f] focus:border-[#126b52] focus:outline-none"
            />
            <button
              onClick={runPaste}
              disabled={pasting || !pasteMd.trim()}
              className="mt-2 rounded-xl bg-[#14231d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#263b32] disabled:opacity-50"
            >
              {pasting ? "Adding…" : "Add article"}
            </button>
          </div>
        </section>

        {/* drafts */}
        <section>
          <div className="flex items-center justify-between">
          <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a9690]">Needs your attention</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
            Review queue{" "}
            <span className="ml-1 rounded-full bg-[#e7ece8] px-2.5 py-1 text-xs">
              {drafts.length}
            </span>
          </h2>
          </div>
          </div>
          {drafts.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-[#cbd6ce] bg-white px-6 py-10 text-center">
              <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-[#e7f5ed] text-[#126b52]">
                <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
                  <path d="m5 10.25 3.1 3.1L15.25 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                </svg>
              </span>
              <p className="mt-4 text-sm font-medium">Your review queue is clear</p>
              <p className="mt-1 text-xs text-[#8a9690]">Run an audit to check for new source changes.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              {drafts.map((d) => {
                const isEditing = editing[d.id] !== undefined;
                return (
                  <div
                    key={d.id}
                    className="rounded-2xl border border-[#e4d49f] bg-[#fffaf0] p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{d.article_title}</h3>
                        <p className="mt-1 text-sm text-[#5d6c64]">
                          <span className="font-medium text-[#263b32]">
                            Why it flagged:
                          </span>{" "}
                          {d.reason}
                        </p>
                        <p className="mt-1 text-xs text-[#9a8d66]">
                          Draft #{d.id} · {fmtDate(d.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditing((e) =>
                              isEditing
                                ? (() => {
                                    const n = { ...e };
                                    delete n[d.id];
                                    return n;
                                  })()
                                : { ...e, [d.id]: d.proposed_markdown }
                            )
                          }
                          className="rounded-full border border-[#d7ca9f] bg-white px-3.5 py-2 text-xs font-semibold hover:border-[#b6a46b]"
                        >
                          {isEditing ? "Cancel edit" : "Edit"}
                        </button>
                        <button
                          onClick={() => rejectDraft(d.id)}
                          disabled={busyDraft === d.id}
                          className="rounded-full border border-[#eccac3] bg-white px-3.5 py-2 text-xs font-semibold text-[#a34334] hover:bg-[#fff0ed] disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => approveDraft(d.id)}
                          disabled={busyDraft === d.id}
                          className="rounded-full bg-[#126b52] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0e5b45] disabled:opacity-50"
                        >
                          {busyDraft === d.id
                            ? "Saving…"
                            : isEditing
                              ? "Save & approve"
                              : "Approve"}
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <textarea
                        value={editing[d.id]}
                        onChange={(e) =>
                          setEditing((prev) => ({ ...prev, [d.id]: e.target.value }))
                        }
                        rows={16}
                        className="mt-4 w-full rounded-xl border border-[#d7ca9f] bg-white p-4 font-mono text-xs leading-relaxed focus:border-[#126b52] focus:outline-none"
                      />
                    ) : (
                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <DiffPane ops={d.ops} side="old" />
                        <DiffPane ops={d.ops} side="new" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* articles */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a9690]">Content library</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
            Articles{" "}
            <span className="ml-1 rounded-full bg-[#e7ece8] px-2.5 py-1 text-xs">
              {articles.length}
            </span>
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-[#d8e0da] bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e1e6e2] bg-[#fafbf9] text-[10px] uppercase tracking-[0.12em] text-[#7b8881]">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Last audit</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-[#edf0ed] last:border-0 hover:bg-[#fafbf9]"
                  >
                    <td className="px-4 py-3 font-medium">{a.title}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-[#7b8881]">
                      {a.source_url ? (
                        <a
                          href={a.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#126b52] hover:underline"
                        >
                          {a.source_url}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#7b8881]">{fmtDate(a.updated_at)}</td>
                    <td className="px-4 py-3 text-[#7b8881]">{fmtDate(a.checked_at)}</td>
                  </tr>
                ))}
                {articles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[#7b8881]">
                      No articles yet — seed demo data or ingest above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

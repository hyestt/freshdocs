"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
        Stale
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
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
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700">
        {side === "old" ? "Current article" : "Proposed update"}
      </div>
      <pre className="max-h-96 overflow-y-auto p-3 font-mono text-xs leading-relaxed">
        {rows.map((o, i) => (
          <div
            key={i}
            className={
              o.type === "del"
                ? "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200"
                : o.type === "add"
                  ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                  : "text-slate-600 dark:text-slate-400"
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500">Loading dashboard…</p>
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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-lg font-bold text-white">
              F
            </span>
            <span className="text-lg font-bold">FreshDocs admin</span>
          </div>
          <button
            onClick={logout}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
        {/* stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
              <p className="mt-1 text-3xl font-bold">{c.value}</p>
              <p className="mt-1 text-xs text-slate-400">{c.hint}</p>
            </div>
          ))}
        </section>

        {/* actions */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Audit & seed</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Re-fetch every article's source page, diff it, and let the AI draft updates for
            anything that went stale.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={runCheck}
              disabled={checking}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {checking ? "Auditing…" : "Check for updates now"}
            </button>
            <button
              onClick={runSeed}
              disabled={seeding}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200 disabled:opacity-50"
            >
              {seeding ? "Seeding…" : "Seed demo data"}
            </button>
          </div>
          {checkMsg && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{checkMsg}</p>}
        </section>

        {/* ingest */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Crawl a docs site</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Same-origin crawl, up to 30 pages.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                value={ingestUrl}
                onChange={(e) => setIngestUrl(e.target.value)}
                placeholder="https://docs.example.com"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
              <button
                onClick={runCrawl}
                disabled={ingesting || !ingestUrl.trim()}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
              >
                {ingesting ? "Crawling…" : "Crawl"}
              </button>
            </div>
            {ingestMsg && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{ingestMsg}</p>}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Paste an article</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Markdown is rendered in the help center.
            </p>
            <input
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
              placeholder="Article title"
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
            <textarea
              value={pasteMd}
              onChange={(e) => setPasteMd(e.target.value)}
              placeholder="# Title&#10;&#10;Write Markdown here…"
              rows={4}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              onClick={runPaste}
              disabled={pasting || !pasteMd.trim()}
              className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
            >
              {pasting ? "Adding…" : "Add article"}
            </button>
          </div>
        </section>

        {/* drafts */}
        <section>
          <h2 className="text-lg font-semibold">
            Review queue{" "}
            <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-800">
              {drafts.length}
            </span>
          </h2>
          {drafts.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
              No pending drafts. Run an audit to generate some — or seed demo data and crawl a
              site that changes often.
            </p>
          ) : (
            <div className="mt-4 space-y-6">
              {drafts.map((d) => {
                const isEditing = editing[d.id] !== undefined;
                return (
                  <div
                    key={d.id}
                    className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900 dark:bg-amber-950/20"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{d.article_title}</h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          <span className="font-medium text-slate-800 dark:text-slate-100">
                            Why it flagged:
                          </span>{" "}
                          {d.reason}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
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
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:border-slate-400 dark:border-slate-700"
                        >
                          {isEditing ? "Cancel edit" : "Edit"}
                        </button>
                        <button
                          onClick={() => rejectDraft(d.id)}
                          disabled={busyDraft === d.id}
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => approveDraft(d.id)}
                          disabled={busyDraft === d.id}
                          className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
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
                        className="mt-4 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs leading-relaxed focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
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
          <h2 className="text-lg font-semibold">
            Articles{" "}
            <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-800">
              {articles.length}
            </span>
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
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
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-4 py-3 font-medium">{a.title}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-500">
                      {a.source_url ? (
                        <a
                          href={a.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-700 hover:underline dark:text-teal-300"
                        >
                          {a.source_url}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(a.updated_at)}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(a.checked_at)}</td>
                  </tr>
                ))}
                {articles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
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

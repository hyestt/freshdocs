"use client";

import Script from "next/script";
import { useState } from "react";
import SiteNav from "../components/SiteNav";

const SNIPPET = `<!-- FreshDocs chat widget — paste before </body> -->
<script
  src="https://YOUR-HOST/api/widget.js"
  data-api="https://YOUR-HOST"
  data-title="Help center"
  async
></script>`;

/**
 * /demo — a fake product page with the real widget loaded, plus the install
 * snippet docs. The bubble in the bottom-right corner is fully functional:
 * it talks to /api/chat on this same host.
 */
export default function DemoPage() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — user can select manually
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Script src="/api/widget.js" data-title="Pulseboard help" strategy="afterInteractive" />
      <SiteNav />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* fake product page */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900 sm:p-12">
          <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
            Demo site — Pulseboard
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Product analytics your whole team actually reads
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            This is a pretend customer website. Look at the bottom-right corner: that chat
            bubble is the real FreshDocs widget, answering from the sample help center.
            Try asking <em>“How much does Pro cost?”</em> or{" "}
            <em>“How do I connect Postgres?”</em>
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.FreshDocsWidget?.open()}
              className="rounded-lg bg-teal-600 px-5 py-2.5 font-semibold text-white hover:bg-teal-700"
            >
              Open the chat
            </button>
          </div>
        </div>

        {/* install docs */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Install it on your site</h2>
            <ol className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
              <li className="flex gap-3">
                <span className="font-bold text-teal-600">1.</span>
                Deploy FreshDocs anywhere Node.js runs and note your public host.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-teal-600">2.</span>
                Paste the snippet before <code>&lt;/body&gt;</code>, replacing{" "}
                <code>YOUR-HOST</code> with your host.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-teal-600">3.</span>
                The bubble appears on every page. <code>data-title</code> sets the panel
                header; omit <code>data-api</code> and it defaults to the script's own
                origin.
              </li>
            </ol>
            <h3 className="mt-8 text-lg font-semibold">How it answers</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Every question is searched against your articles with SQLite FTS5, then
              answered by your configured LLM with inline citations like [1], [2] that
              link back to the source articles. With no API key set, it falls back to
              extractive snippets — the widget never breaks.
            </p>
          </div>
          <div>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
                <span className="text-xs font-medium text-slate-300">widget snippet</span>
                <button
                  onClick={copy}
                  className="rounded bg-slate-700 px-3 py-1 text-xs font-medium text-white hover:bg-slate-600"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <pre className="overflow-x-auto bg-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-200">
                {SNIPPET}
              </pre>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-slate-100">JavaScript API</p>
              <p className="mt-1 font-mono text-xs">
                window.FreshDocsWidget.open() · window.FreshDocsWidget.close()
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Keep TypeScript happy about the widget's global.
declare global {
  interface Window {
    FreshDocsWidget?: { open: () => void; close: () => void };
  }
}

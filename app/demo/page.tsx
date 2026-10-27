"use client";

import Script from "next/script";
import { useState } from "react";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";

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
    <div className="min-h-screen bg-[#fbfcf9] text-[#14231d]">
      <Script src="/api/widget.js" data-title="Pulseboard help" strategy="afterInteractive" />
      <SiteNav />

      <main>
        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
          <div className="grid overflow-hidden rounded-[28px] border border-[#d4ddd6] bg-white shadow-[0_24px_60px_rgba(36,61,50,0.08)] lg:grid-cols-[1.08fr_.92fr]">
            <div className="p-7 sm:p-12 lg:p-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#edf4f0] px-3 py-1.5 text-xs font-semibold text-[#315e4d]">
                <span className="size-1.5 rounded-full bg-[#20a77a]" />
                Live widget demo
              </div>
              <p className="mt-10 text-sm font-semibold text-[#126b52]">Pulseboard</p>
              <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-5xl">
                Product analytics your whole team actually reads.
              </h1>
              <p className="mt-6 max-w-xl leading-7 text-[#69776f]">
                This sample product has the real FreshDocs assistant installed. Ask a question
                and see how it answers from approved help content.
              </p>
              <button
                onClick={() => window.FreshDocsWidget?.open()}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#126b52] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(18,107,82,0.2)] hover:-translate-y-0.5 hover:bg-[#0e5b45]"
              >
                Open the assistant
                <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
                  <path d="M4 10h12m-4-4 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </button>
              <p className="mt-5 text-xs text-[#8a9690]">
                Try “How much does Pro cost?” or “How do I connect Postgres?”
              </p>
            </div>
            <div className="relative min-h-[400px] overflow-hidden bg-[#15251f] p-6 sm:p-10">
              <div className="absolute -right-16 -top-16 size-56 rounded-full bg-[#1e765b] blur-3xl" aria-hidden="true" />
              <div className="relative mx-auto max-w-sm rounded-[22px] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <span className="size-2.5 rounded-full bg-[#ff856f]" />
                  <span className="size-2.5 rounded-full bg-[#f7c55d]" />
                  <span className="size-2.5 rounded-full bg-[#62c99a]" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {["24.8k", "8.4%", "1,204"].map((value) => (
                    <div key={value} className="rounded-xl bg-white/8 p-3">
                      <p className="text-lg font-semibold text-white">{value}</p>
                      <div className="mt-2 h-1.5 w-10 rounded-full bg-white/15" />
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-xl bg-white/8 p-4">
                  <div className="flex h-32 items-end gap-2">
                    {[42, 65, 48, 78, 56, 92, 72, 100, 84].map((height, index) => (
                      <div key={index} className="flex-1 rounded-t bg-[#62c99a]" style={{ height: `${height}%`, opacity: .45 + index * .05 }} />
                    ))}
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-10 rounded-xl bg-white/8" />
                  <div className="h-10 rounded-xl bg-white/8" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#dfe5df] bg-[#f4f6f2]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#126b52]">Install once</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Add helpful answers to any site.</h2>
                <p className="mt-5 leading-7 text-[#69776f]">
                  Paste one script before <code className="rounded bg-[#e7ece8] px-1.5 py-0.5 text-sm">&lt;/body&gt;</code>.
                  The assistant searches your approved articles and includes source links in every response.
                </p>
                <ol className="mt-8 space-y-5">
                  {[
                    "Deploy FreshDocs and copy your public host.",
                    "Paste the snippet and replace YOUR-HOST.",
                    "Set the panel title, then publish.",
                  ].map((step, index) => (
                    <li key={step} className="flex items-center gap-4 text-sm font-medium">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#cbd6ce] bg-white font-mono text-xs text-[#126b52]">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <div className="overflow-hidden rounded-2xl border border-[#273a32] bg-[#101c17] shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                    <span className="font-mono text-xs text-[#92a59c]">widget.html</span>
                    <button
                      onClick={copy}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
                    >
                      {copied ? "Copied" : "Copy code"}
                    </button>
                  </div>
                  <pre className="overflow-x-auto p-5 font-mono text-sm leading-7 text-[#d6e2dc]">{SNIPPET}</pre>
                </div>
                <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-[#d8e0da] bg-white p-5 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold">JavaScript API</p>
                  <code className="text-xs text-[#5d6c64]">FreshDocsWidget.open() · .close()</code>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

// Keep TypeScript happy about the widget's global.
declare global {
  interface Window {
    FreshDocsWidget?: { open: () => void; close: () => void };
  }
}

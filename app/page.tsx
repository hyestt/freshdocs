import Link from "next/link";
import SiteNav from "./components/SiteNav";

const FEATURES = [
  {
    icon: "🔍",
    title: "Continuous AI audits",
    body: "FreshDocs re-reads your product docs on a schedule and diffs them against every help article. When something drifts, you'll know before your customers do.",
  },
  {
    icon: "✍️",
    title: "Drafts, not surprises",
    body: "The AI never publishes on its own. It drafts an updated article with a plain-English explanation of what changed — you approve, edit, or reject in one click.",
  },
  {
    icon: "⚡",
    title: "One-click ingest",
    body: "Paste a docs URL and FreshDocs crawls up to 30 pages into clean articles, or paste Markdown directly. Your help center is seeded in minutes.",
  },
  {
    icon: "💬",
    title: "Chat widget that cites sources",
    body: "Drop one script tag on your site and visitors get instant answers grounded in your articles — every answer links back to the source article.",
  },
  {
    icon: "🔎",
    title: "Search that actually works",
    body: "Full-text search over every article with typo-tolerant matching, so customers find answers instead of filing tickets.",
  },
  {
    icon: "🧪",
    title: "Works without an API key",
    body: "No LLM key? No problem. Staleness checks fall back to a transparent line-diff heuristic and chat answers fall back to extractive snippets. The demo always works.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Connect your content",
    body: "Crawl your existing docs site or paste Markdown. Each article remembers where it came from, so audits always have a source of truth to compare against.",
  },
  {
    n: "2",
    title: "Let the auditor work",
    body: "Hit “Check for updates” (or schedule it). FreshDocs re-fetches every source page, diffs it, and asks the AI whether the article is still accurate.",
  },
  {
    n: "3",
    title: "Review and publish",
    body: "Stale articles land in your review queue with a side-by-side diff and a rewritten draft. Approve it as-is, tweak it, or reject it — you're always in control.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SiteNav />

      {/* ---------------------------------------------------------- HERO */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-200">
            AI-native help centers
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            The help center that{" "}
            <span className="text-teal-600 dark:text-teal-400">never goes out of date</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            FreshDocs watches your product, audits every help article with AI, and drafts
            updates for your approval — so your docs stay right without the busywork.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/demo"
              className="rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-700"
            >
              Try the live demo
            </Link>
            <Link
              href="/docs"
              className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white"
            >
              Browse sample docs
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            No credit card · Works without an LLM key · Self-hosted in one command
          </p>
        </div>
      </section>

      {/* ------------------------------------------------- PROBLEM/SOLUTION */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Docs rot. Tickets pile up. Nobody has time.</h2>
            <ul className="mt-6 space-y-4 text-slate-600 dark:text-slate-300">
              <li className="flex gap-3">
                <span className="text-red-500">✕</span>
                Your product shipped three releases; the help center still describes version one.
              </li>
              <li className="flex gap-3">
                <span className="text-red-500">✕</span>
                Support answers the same five questions every week because the articles are wrong.
              </li>
              <li className="flex gap-3">
                <span className="text-red-500">✕</span>
                Nobody wants to own docs, so “update the help center” lives at the bottom of every sprint.
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">FreshDocs keeps docs fresh automatically.</h2>
            <ul className="mt-6 space-y-4 text-slate-600 dark:text-slate-300">
              <li className="flex gap-3">
                <span className="text-teal-600">✓</span>
                An AI auditor continuously compares each article against its source page.
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600">✓</span>
                Material changes become review-ready drafts with a clear explanation.
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600">✓</span>
                You approve in one click — or edit first. Nothing publishes without a human.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Everything a help center should do in 2026
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600 dark:text-slate-300">
          Ingest, audit, draft, answer — one small app that covers the whole lifecycle of
          support content.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ HOW IT WORKS */}
      <section
        id="how"
        className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Simple pricing that scales with you
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600 dark:text-slate-300">
          Start free. Pay when your docs — and your team — grow.
        </p>
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
          {[
            {
              name: "Hobby",
              price: "$0",
              per: "forever",
              feats: ["Up to 50 articles", "Manual audits", "Chat widget", "Community support"],
              cta: "Start for free",
              hot: false,
            },
            {
              name: "Pro",
              price: "$29",
              per: "/month",
              feats: [
                "Unlimited articles",
                "Scheduled AI audits",
                "Draft review queue",
                "Priority support",
              ],
              cta: "Start 14-day trial",
              hot: true,
            },
            {
              name: "Scale",
              price: "$99",
              per: "/month",
              feats: ["Everything in Pro", "SSO / SAML", "Audit log & roles", "Dedicated success manager"],
              cta: "Talk to us",
              hot: false,
            },
          ].map((t) => (
            <div
              key={t.name}
              className={`rounded-xl border p-6 ${
                t.hot
                  ? "border-teal-600 shadow-lg dark:border-teal-500"
                  : "border-slate-200 dark:border-slate-800"
              } bg-white dark:bg-slate-900`}
            >
              {t.hot && (
                <span className="mb-2 inline-block rounded-full bg-teal-600 px-3 py-0.5 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-bold">{t.price}</span>
                <span className="text-sm text-slate-500"> {t.per}</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {t.feats.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-teal-600">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/demo"
                className={`mt-6 block rounded-lg px-4 py-2 text-center text-sm font-semibold transition-colors ${
                  t.hot
                    ? "bg-teal-600 text-white hover:bg-teal-700"
                    : "border border-slate-300 text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- CTA */}
      <section className="bg-teal-700 dark:bg-teal-900">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Stop letting your docs go stale.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-teal-100">
            Seed a demo help center in one click, run an AI audit, and chat with your docs —
            all in under five minutes.
          </p>
          <Link
            href="/admin"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-teal-800 transition-colors hover:bg-teal-50"
          >
            Open the admin dashboard
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------- FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">
              F
            </span>
            <span className="font-semibold">FreshDocs</span>
            <span className="text-sm text-slate-500">— the help center that never goes out of date.</span>
          </div>
          <div className="flex gap-5 text-sm text-slate-500">
            <Link href="/docs" className="hover:text-slate-800 dark:hover:text-slate-200">
              Docs
            </Link>
            <Link href="/demo" className="hover:text-slate-800 dark:hover:text-slate-200">
              Widget demo
            </Link>
            <Link href="/admin" className="hover:text-slate-800 dark:hover:text-slate-200">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

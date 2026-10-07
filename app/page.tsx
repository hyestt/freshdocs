import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import SiteNav from "./components/SiteNav";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

const CONTACT = "founder@freshdoc.dev";

// status: "now" = shipped in this build, "next" = planned. Keep this honest.
const FEATURES: { title: string; body: string; status: "now" | "next" }[] = [
  {
    title: "AI audits on demand",
    body: "Click “Check for updates” and FreshDocs re-fetches every source page, diffs it against the article, and asks the model whether a reader would now be misled.",
    status: "now",
  },
  {
    title: "Drafts wait for you",
    body: "Stale articles get a rewritten draft and a one-line reason. Approve, edit, or reject. Nothing publishes without a person.",
    status: "now",
  },
  {
    title: "Import from a URL or Markdown",
    body: "Paste a docs URL and FreshDocs crawls up to 30 pages into articles, each linked to the page it came from. Or paste Markdown directly.",
    status: "now",
  },
  {
    title: "Chat widget with citations",
    body: "One script tag adds a help bubble to your site. Every answer links to the article it came from.",
    status: "now",
  },
  {
    title: "Works without an API key",
    body: "No model key yet? Audits fall back to a line diff and chat falls back to quoted snippets, so the demo always runs.",
    status: "now",
  },
  {
    title: "Scheduled audits",
    body: "Run the audit on a schedule instead of by hand, and get the review queue in your inbox.",
    status: "next",
  },
];

const STEPS = [
  {
    title: "Connect your content",
    body: "Crawl your docs site or paste Markdown. Each article remembers its source page.",
  },
  {
    title: "Run the audit",
    body: "FreshDocs compares every article with its source and flags the ones that changed in a way readers would notice.",
  },
  {
    title: "Review and publish",
    body: "Open the review queue, read the diff and the reason, and approve the draft in one click.",
  },
];

export default function LandingPage() {
  return (
    <div className={`lp ${display.variable} min-h-screen`}>
      <SiteNav />

      {/* ---------------------------------------------------------- HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div>
          <p className="lp-eyebrow">AI audits for help centers</p>
          <h1 className="lp-display mt-5 text-[2.6rem] leading-[1.02] sm:text-6xl">
            The help center that <span className="lp-fresh-word">never goes out of date</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-(--lp-muted)">
            FreshDocs checks every help article against the product page it was written from.
            When the product changes, you get a drafted update to approve — before a customer
            follows the old steps.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="lp-btn lp-btn-primary">
              Try the live demo
            </Link>
            <Link href="/docs" className="lp-btn lp-btn-quiet">
              Browse sample docs
            </Link>
          </div>
          <p className="mt-5 text-sm text-(--lp-muted)">
            Free during early access · Every change waits for human approval
          </p>
        </div>

        <ReviewCard />
      </section>

      {/* ------------------------------------------------------- PROBLEM */}
      <section className="border-y border-(--lp-line) bg-(--lp-surface)">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1.4fr] md:items-start">
          <h2 className="lp-display text-3xl leading-tight">Docs go stale quietly.</h2>
          <p className="text-lg leading-relaxed text-(--lp-muted)">
            A limit changes, a menu moves, a step disappears. The help article still says the old
            thing, support answers the same ticket again, and nobody owns the fix. FreshDocs
            watches the source so a person only has to make the call.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------ FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="lp-display text-3xl sm:text-4xl">What it does today</h2>
          <p className="flex items-center gap-4 text-sm text-(--lp-muted)">
            <span className="lp-tag lp-tag-now">Now</span> shipped
            <span className="lp-tag lp-tag-next">Next</span> in progress
          </p>
        </div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-(--lp-line) bg-(--lp-line) sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-(--lp-surface) p-6">
              <span className={`lp-tag ${f.status === "now" ? "lp-tag-now" : "lp-tag-next"}`}>
                {f.status === "now" ? "Now" : "Next"}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-(--lp-muted)">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- HOW IT WORKS */}
      <section id="how" className="border-y border-(--lp-line) bg-(--lp-surface)">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="lp-display text-3xl sm:text-4xl">How it works</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="lp-step">{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-(--lp-muted)">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------------------------- EARLY ACCESS */}
      <section id="early-access" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="lp-access grid gap-8 rounded-3xl p-8 sm:p-12 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="lp-eyebrow lp-eyebrow-invert">Early access</p>
            <h2 className="lp-display mt-4 text-3xl leading-tight sm:text-4xl">
              Free while we build it with our first teams.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed opacity-85">
              Tell us where your docs live. We’ll set up a help center, run the first audit, and
              send you the review queue.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <a href={`mailto:${CONTACT}?subject=FreshDocs%20early%20access`} className="lp-btn lp-btn-invert">
              Request early access
            </a>
            <Link href="/demo" className="lp-btn lp-btn-invert-quiet">
              Try the live demo first
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- FOOTER */}
      <footer className="border-t border-(--lp-line)">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--lp-fresh) text-sm font-bold text-white">
                F
              </span>
              <span className="font-semibold">FreshDocs</span>
            </div>
            <p className="mt-3 text-sm text-(--lp-muted)">© 2026 FreshDocs · Built in Seattle</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-(--lp-muted)">
            <Link href="/docs" className="lp-link">Docs</Link>
            <Link href="/demo" className="lp-link">Widget demo</Link>
            <a href={`mailto:${CONTACT}`} className="lp-link">{CONTACT}</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/** Hero visual: one item from the review queue, using the demo's sample article. */
function ReviewCard() {
  return (
    <figure className="lp-card" aria-label="Example of a drafted update in the FreshDocs review queue">
      <div className="flex items-center justify-between gap-3 border-b border-(--lp-line) px-5 py-3">
        <span className="lp-mono truncate text-xs text-(--lp-muted)">
          help / connecting-a-data-source
        </span>
        <span className="lp-tag lp-tag-stale">Stale</span>
      </div>

      <div className="lp-mono space-y-1 px-5 py-4 text-[0.8rem] leading-relaxed">
        <p className="lp-ctx">## CSV upload</p>
        <p className="lp-ctx">1. Go to Sources → Add source → CSV.</p>
        <p className="lp-del">
          <span aria-hidden>−</span> 2. Upload a file up to <mark className="lp-mark">500 MB</mark>.
        </p>
        <p className="lp-add">
          <span aria-hidden>+</span> 2. Upload a file up to <strong>2 GB</strong>.
        </p>
        <p className="lp-ctx">3. Map each column to a type and click Import.</p>
      </div>

      <div className="lp-reason mx-5 rounded-lg px-4 py-3 text-sm">
        <span className="font-semibold">Why it’s stale: </span>
        the source page now allows CSV uploads up to 2 GB.
      </div>

      <div className="flex items-center justify-end gap-2 px-5 py-4" aria-hidden>
        <span className="lp-chip">Reject</span>
        <span className="lp-chip">Edit</span>
        <span className="lp-chip lp-chip-primary">Approve draft</span>
      </div>
      <figcaption className="border-t border-(--lp-line) px-5 py-2.5 text-xs text-(--lp-muted)">
        Example from the demo help center
      </figcaption>
    </figure>
  );
}

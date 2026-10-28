import Link from "next/link";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";

const Arrow = () => (
  <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
    <path d="M4 10h12m-4.5-4.5L16 10l-4.5 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
    <path d="m5 10.25 3.1 3.1L15.25 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fbfcf9] text-[#14231d]">
      <SiteNav />

      <main>
        <section className="relative overflow-hidden border-b border-[#dfe5df]">
          <div className="soft-grid absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.02fr_.98fr] lg:py-32">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#cddbd3] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#315e4d] shadow-sm">
                <span className="size-1.5 rounded-full bg-[#20a77a]" />
                Audit, review, publish
              </div>
              <h1 className="mt-7 max-w-3xl text-[2.9rem] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-[4.5rem]">
                Keep your help center in step with your product.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#5d6c64]">
                FreshDocs compares every article with its source, drafts updates when facts
                change, and puts your team in control of what gets published.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#126b52] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(18,107,82,0.22)] hover:-translate-y-0.5 hover:bg-[#0e5b45]"
                >
                  Try the audit workflow <Arrow />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center rounded-full border border-[#ccd5cf] bg-white px-6 py-3.5 text-sm font-semibold text-[#263b32] hover:border-[#9fb4a8] hover:bg-[#f6f8f4]"
                >
                  See the chat widget
                </Link>
              </div>
              <p className="mt-5 text-xs font-medium text-[#7b8881]">
                Self-hosted · No credit card · Works without an LLM key
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[580px]">
              <div className="absolute -left-10 top-20 size-44 rounded-full bg-[#d9f1e5] blur-3xl" aria-hidden="true" />
              <div className="absolute -right-8 bottom-4 size-48 rounded-full bg-[#f5e6ad] blur-3xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[28px] border border-[#cad5ce] bg-white p-3 shadow-[0_32px_80px_rgba(36,61,50,0.15)]">
                <div className="rounded-[20px] bg-[#f4f6f2] p-5 sm:p-7">
                  <div className="flex items-center justify-between border-b border-[#dce3dd] pb-5">
                    <div>
                      <p className="text-xs font-medium text-[#7b8881]">Workspace overview</p>
                      <p className="mt-1 text-sm font-semibold">Documentation health</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#477061] shadow-sm">
                      <span className="size-1.5 rounded-full bg-[#20a77a]" />
                      Audit complete
                    </div>
                  </div>
                  <div className="grid gap-3 py-5 sm:grid-cols-3">
                    {[
                      ["94%", "Healthy"],
                      ["128", "Articles"],
                      ["3", "To review"],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-2xl border border-[#e0e6e1] bg-white p-4">
                        <p className="text-2xl font-semibold tracking-[-0.04em]">{value}</p>
                        <p className="mt-1 text-xs text-[#7b8881]">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-[#e0e6e1] bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#fff2c8] text-[#7c6217]">
                          <svg viewBox="0 0 20 20" className="size-4" fill="none">
                            <path d="M10 6v4m0 3h.01M10 2.75 17.25 16H2.75L10 2.75Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-sm font-semibold">Connect a data source</p>
                          <p className="mt-1 text-xs leading-5 text-[#7b8881]">
                            Source changed · Draft ready for review
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#edf4f0] px-2.5 py-1 text-[11px] font-semibold text-[#315e4d]">
                        Review
                      </span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-2 w-full rounded-full bg-[#e4e9e5]" />
                      <div className="h-2 w-4/5 rounded-full bg-[#e4e9e5]" />
                      <div className="h-2 w-2/3 rounded-full bg-[#d4eadf]" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#e0e6e1] bg-white p-4">
                    <div>
                      <p className="text-sm font-semibold">Inviting teammates</p>
                      <p className="mt-1 text-xs text-[#7b8881]">Checked 8 minutes ago</p>
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#e4f3eb] text-[#126b52]"><Check /></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#dfe5df] bg-white">
          <div className="mx-auto grid max-w-7xl gap-px bg-[#dfe5df] sm:grid-cols-3">
            {[
              ["30 pages", "ingested in one crawl"],
              ["One queue", "for every content change"],
              ["Human approval", "before anything publishes"],
            ].map(([value, label]) => (
              <div key={value} className="bg-white px-8 py-8 text-center">
                <p className="text-xl font-semibold tracking-[-0.03em]">{value}</p>
                <p className="mt-1 text-sm text-[#7b8881]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-14 lg:grid-cols-[.78fr_1.22fr] lg:gap-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#126b52]">A calmer workflow</p>
              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
                From product change to published answer.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#69776f]">
                FreshDocs turns content maintenance into a small, visible loop your team can
                actually keep up with.
              </p>
            </div>
            <div className="divide-y divide-[#dfe5df] border-y border-[#dfe5df]">
              {[
                ["01", "Connect the source", "Crawl an existing docs site or bring your own Markdown. Every article keeps its source attached."],
                ["02", "Run a focused audit", "FreshDocs compares the source with the published answer and only flags material changes."],
                ["03", "Review with context", "See what changed, edit the proposed copy, and publish only when it is ready."],
              ].map(([n, title, body]) => (
                <div key={n} className="grid gap-4 py-7 sm:grid-cols-[52px_180px_1fr] sm:items-start">
                  <span className="font-mono text-xs text-[#9aa59f]">{n}</span>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm leading-6 text-[#69776f]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#14231d] text-white">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#85d5b5]">Everything in one place</p>
              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
                Less content debt. Better answers.
              </h2>
            </div>
            <div className="mt-14 grid gap-px overflow-hidden rounded-[24px] bg-white/15 md:grid-cols-2">
              {[
                ["Audit what matters", "A transparent line diff filters out tiny changes before asking AI to judge accuracy."],
                ["Draft, never auto-publish", "Every suggested update lands in a review queue with the reason it was flagged."],
                ["Answer with citations", "The lightweight chat widget grounds each response in your approved help articles."],
                ["Keep the stack simple", "SQLite, Next.js, and an optional LLM key. Self-host it without stitching together five services."],
              ].map(([title, body], index) => (
                <div key={title} className="bg-[#14231d] p-7 sm:p-9">
                  <span className="font-mono text-xs text-[#85d5b5]">0{index + 1}</span>
                  <h3 className="mt-8 text-xl font-semibold tracking-[-0.025em]">{title}</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-[#afbbb5]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#126b52]">Simple pricing</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Start small. Stay flexible.</h2>
              <p className="mt-5 max-w-md leading-7 text-[#69776f]">
                Explore the full workflow for free, then add capacity when your help center grows.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  name: "Hobby",
                  price: "$0",
                  note: "For personal projects",
                  features: ["Up to 50 articles", "On-demand audits", "Search and chat widget"],
                  primary: false,
                },
                {
                  name: "Pro",
                  price: "$29",
                  note: "For growing teams · per month",
                  features: ["Unlimited articles", "Review-ready AI drafts", "Priority support"],
                  primary: true,
                },
              ].map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-[24px] border p-7 ${tier.primary ? "border-[#126b52] bg-[#eef6f1]" : "border-[#d8e0da] bg-white"}`}
                >
                  <p className="text-sm font-semibold">{tier.name}</p>
                  <p className="mt-6 text-4xl font-semibold tracking-[-0.05em]">{tier.price}</p>
                  <p className="mt-2 text-xs text-[#7b8881]">{tier.note}</p>
                  <ul className="mt-7 space-y-3 text-sm text-[#4e6057]">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5">
                        <span className="text-[#126b52]"><Check /></span>{feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/admin"
                    className={`mt-8 flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
                      tier.primary
                        ? "bg-[#126b52] text-white hover:bg-[#0e5b45]"
                        : "border border-[#cbd6ce] bg-white text-[#263b32] hover:border-[#9fb4a8]"
                    }`}
                  >
                    Open workspace
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#dff0e7] px-6 py-14 text-center sm:px-12 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#126b52]">See it in action</p>
            <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              Give every product change a clear path to the docs.
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-[#50645a]">
              Seed the demo, run an audit, and review your first suggested update in minutes.
            </p>
            <Link
              href="/admin"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#14231d] px-6 py-3.5 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-[#126b52]"
            >
              Open the dashboard <Arrow />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

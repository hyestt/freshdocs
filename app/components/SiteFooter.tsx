import Link from "next/link";
import Brand from "./Brand";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#dfe5df] bg-[#f6f7f3]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Brand />
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#5d6c64]">
            A help center that stays accurate as your product changes.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-[#5d6c64]">
          <Link href="/docs" className="transition-colors hover:text-[#126b52]">Help center</Link>
          <Link href="/demo" className="transition-colors hover:text-[#126b52]">Live demo</Link>
          <Link href="/#pricing" className="transition-colors hover:text-[#126b52]">Pricing</Link>
          <Link href="/admin" className="transition-colors hover:text-[#126b52]">Admin</Link>
        </div>
      </div>
      <div className="border-t border-[#dfe5df]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-[#7b8881] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© 2026 FreshDocs</span>
          <span>Built for calm, accurate support.</span>
        </div>
      </div>
    </footer>
  );
}

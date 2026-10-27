import Link from "next/link";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex size-9 items-center justify-center rounded-xl bg-[#126b52] text-white shadow-[0_8px_24px_rgba(18,107,82,0.18)] ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M7 5.75A1.75 1.75 0 0 1 8.75 4h6.5A1.75 1.75 0 0 1 17 5.75v12.5A1.75 1.75 0 0 1 15.25 20h-6.5A1.75 1.75 0 0 1 7 18.25V5.75Z"
          fill="currentColor"
          fillOpacity=".18"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M10 8h4M10 11.5h4M10 15h2.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

export default function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5" aria-label="FreshDocs home">
      <BrandMark />
      <span className="text-[17px] font-semibold tracking-[-0.03em] text-[#14231d]">
        FreshDocs
      </span>
    </Link>
  );
}

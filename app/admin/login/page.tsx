"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Brand, { BrandMark } from "../../components/Brand";

/** /admin/login — password form that sets the admin cookie via /api/login. */
export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Wrong password. Check ADMIN_PASSWORD in your .env.local.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-[#f5f7f3] text-[#14231d] lg:grid-cols-2">
      <div className="hidden flex-col justify-between overflow-hidden bg-[#14231d] p-12 text-white lg:flex">
        <BrandMark className="bg-white/10 shadow-none" />
        <div className="relative max-w-lg">
          <div className="absolute -left-20 -top-32 size-64 rounded-full bg-[#267e61]/40 blur-3xl" aria-hidden="true" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-[#85d5b5]">FreshDocs workspace</p>
          <p className="relative mt-5 text-4xl font-semibold leading-tight tracking-[-0.045em]">
            Give every customer an answer you can trust.
          </p>
          <p className="relative mt-5 max-w-md leading-7 text-[#aebbb5]">
            Audit source content, review suggested updates, and keep your help center accurate from one calm workspace.
          </p>
        </div>
        <p className="text-xs text-[#71827a]">Source-checked documentation, without the busywork.</p>
      </div>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-5 py-6 sm:px-10">
          <div className="lg:hidden"><Brand /></div>
          <Link href="/" className="ml-auto text-sm font-medium text-[#69776f] hover:text-[#126b52]">
            Back to website
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-5 pb-20">
          <form onSubmit={submit} className="w-full max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#126b52]">Admin access</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Welcome back</h1>
            <p className="mt-3 text-sm leading-6 text-[#69776f]">
              Enter the password configured for this workspace.
            </p>
            <label htmlFor="password" className="mt-8 block text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your admin password"
              autoFocus
              className="mt-2 w-full rounded-xl border border-[#cbd6ce] bg-white px-4 py-3 text-sm shadow-sm placeholder:text-[#9aa59f] focus:border-[#126b52] focus:outline-none"
            />
            {error && (
              <p role="alert" className="mt-3 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm text-[#a34334]">{error}</p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="mt-5 w-full rounded-full bg-[#126b52] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(18,107,82,0.2)] hover:bg-[#0e5b45] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign in to workspace"}
            </button>
            <p className="mt-5 text-center text-xs leading-5 text-[#8a9690]">
              Use the <code className="rounded bg-[#e9ede9] px-1.5 py-0.5">ADMIN_PASSWORD</code> value from your environment.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

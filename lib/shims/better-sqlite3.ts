// lib/shims/better-sqlite3.ts — empty stand-in for the better-sqlite3 native
// module, used ONLY in the Cloudflare Workers build (CF_WORKERS_BUILD=1).
//
// workerd cannot load native .node bindings. The Workers deployment always
// uses the D1 backend (DB_BACKEND=d1), which never touches better-sqlite3,
// so aliasing it to this shim keeps it out of the worker bundle. If anything
// ever does reach it, it throws a clear error instead of a cryptic one.

function thrower(): never {
  throw new Error(
    "better-sqlite3 is not available in the Cloudflare Workers build. " +
      "Use DB_BACKEND=d1 (the D1 backend) on Workers."
  );
}

const BetterSqlite3Shim: unknown = new Proxy(thrower, {
  construct: thrower,
  apply: thrower,
  get: thrower,
});

export default BetterSqlite3Shim;

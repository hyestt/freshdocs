import type { NextConfig } from "next";

// CF_WORKERS_BUILD=1 → building the Cloudflare Workers bundle via
// `npx opennextjs-cloudflare build`. In that build:
//  - better-sqlite3's native bindings cannot run in workerd. The D1 backend
//    never loads it, so alias it to an empty shim to keep it out of the
//    bundle (and drop it from serverExternalPackages so the alias applies).
//  - Local/dev builds are untouched: better-sqlite3 stays external as before.
const isWorkersBuild = process.env.CF_WORKERS_BUILD === "1";

const nextConfig: NextConfig = {
  ...(isWorkersBuild
    ? {}
    : {
        // better-sqlite3 ships native bindings — keep it out of the Server
        // Components bundler and load it with plain Node require() instead.
        serverExternalPackages: ["better-sqlite3"],
      }),
  ...(isWorkersBuild
    ? {
        turbopack: {
          resolveAlias: {
            "better-sqlite3": "./lib/shims/better-sqlite3.ts",
          },
        },
        webpack: (config: {
          resolve?: { alias?: Record<string, string> };
        }) => {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const path = require("node:path") as typeof import("node:path");
          config.resolve = config.resolve ?? {};
          config.resolve.alias = {
            ...(config.resolve.alias ?? {}),
            "better-sqlite3": path.join(__dirname, "lib", "shims", "better-sqlite3.ts"),
          };
          return config;
        },
      }
    : {}),
};

export default nextConfig;

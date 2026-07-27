// Type declarations for the Cloudflare Workers bindings this app relies on in
// production. `CloudflareEnv` is the interface @opennextjs/cloudflare uses for
// `getCloudflareContext().env`, so declaring `DB` here makes the D1 binding
// type-safe throughout the app.
//
// We import the D1Database type by name rather than pulling in
// @cloudflare/workers-types via a global `/// <reference>` on purpose: the full
// global augmentation would override the DOM `fetch`/`Response` types this
// Next.js app depends on. A named type import touches only the symbol we need.
//
// Bindings are configured in wrangler.jsonc.
import type { D1Database } from "@cloudflare/workers-types";

declare global {
  /** Cloudflare bindings available via getCloudflareContext().env. */
  interface CloudflareEnv {
    /** Cloudflare D1 database binding (production persistence). */
    DB: D1Database;
  }

  /** Make the D1Database type available globally without the DOM-clobbering side effects. */
  type D1Database = import("@cloudflare/workers-types").D1Database;
}

export {};

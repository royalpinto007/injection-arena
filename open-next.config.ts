import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// OpenNext adapter configuration for deploying this Next.js app to Cloudflare
// Workers. Defaults are sufficient here: the app only needs the D1 binding
// (declared in wrangler.jsonc) for persistence. No incremental cache or queue
// overrides are required.
export default defineCloudflareConfig({});

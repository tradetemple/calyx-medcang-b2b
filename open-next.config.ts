import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache"; // Import the KV override [1.1.5]

export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache, // Binds "use cache" directly to Cloudflare KV [1.1.5]
});
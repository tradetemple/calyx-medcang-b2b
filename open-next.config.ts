import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

export default defineCloudflareConfig({
  // Wrap R2 in the regional cache for lightning-fast edge delivery,
  // but leave out the buggy 'shouldLazilyUpdateOnCacheHit' flag!
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: "long-lived"
  }),
  
  // Keep these disabled to avoid D1/Queue setup overhead
  tagCache: "dummy",
  queue: memoryQueue
});
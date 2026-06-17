import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

// populateCache 在每次部署时把 360 个页面写入 KV（约 363 次写入）。
// revalidate=false + force-cache 确保运行时零额外 KV 写入，只有 cron 的 144次/天。
// 每天可安全部署 1-2 次（363×2 + 144 = 870 < 1000）。
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
});

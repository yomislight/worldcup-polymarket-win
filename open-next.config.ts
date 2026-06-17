import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// 用 Cloudflare Assets CDN 替代 KV 缓存：
// - 0 KV 写（不再受 1000次/天 free quota 限制）
// - 性能更好（直接 CDN 命中）
// - 所有页面已 force-static + revalidate=false，完美适配
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});

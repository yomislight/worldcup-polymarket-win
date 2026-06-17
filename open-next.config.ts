import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// 所有页面已全部 force-static，无需 ISR，使用默认内存缓存，彻底避免运行时 KV 写入。
export default defineCloudflareConfig({});

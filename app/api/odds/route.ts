import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

const KV_KEY = "polymarket:winner:v1";
const GAMMA = "https://gamma-api.polymarket.com";
const SLUGS = ["world-cup-winner", "fifa-world-cup-2026-winner"];

type Outcome = { label: string; price: number; url: string };

// KV 拿不到时（迁移到 static-assets 缓存后）直接现场拉 Polymarket
async function fetchLiveOdds(): Promise<{ outcomes: Outcome[]; updatedAt: number } | null> {
  for (const slug of SLUGS) {
    try {
      const r = await fetch(`${GAMMA}/events?slug=${slug}`, {
        headers: { accept: "application/json" },
      });
      if (!r.ok) continue;
      const events = await r.json();
      for (const ev of Array.isArray(events) ? events : [events]) {
        const mkts = ev?.markets ?? [];
        const outcomes: Outcome[] = mkts
          .map((m: { groupItemTitle?: string; outcomes?: string; outcomePrices?: string; slug?: string }) => {
            const label = m.groupItemTitle || safeParseArr<string>(m.outcomes)?.[0] || "?";
            const price = parseFloat(safeParseArr<string>(m.outcomePrices)?.[0] ?? "0");
            const url = m.slug
              ? `https://polymarket.com/zh/event/${ev.slug}/${m.slug}`
              : `https://polymarket.com/zh/event/${ev.slug}`;
            return { label, price, url };
          })
          .filter((o: Outcome) => o.price > 0.001)
          .sort((a: Outcome, b: Outcome) => b.price - a.price);
        if (outcomes.length >= 2) return { outcomes, updatedAt: Date.now() };
      }
    } catch {}
  }
  return null;
}

function safeParseArr<T>(s: unknown): T[] | undefined {
  if (Array.isArray(s)) return s as T[];
  if (typeof s === "string") {
    try { return JSON.parse(s); } catch { return undefined; }
  }
  return undefined;
}

export async function GET() {
  // 1. 优先从 KV 读（cron 写入的实时盘口）
  try {
    const { env } = getCloudflareContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kv = (env as any).NEXT_INC_CACHE_KV;
    if (kv) {
      const val = await kv.get(KV_KEY, "json");
      if (val) {
        return Response.json(val, { headers: { "cache-control": "no-store" } });
      }
    }
  } catch {}

  // 2. KV 不可用 / 没数据 → 现场拉 Polymarket
  const live = await fetchLiveOdds();
  return Response.json(live, {
    headers: { "cache-control": "public, max-age=60, s-maxage=60" },
  });
}

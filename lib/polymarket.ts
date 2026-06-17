// Server-side Polymarket (Gamma API) client. Public, no key required.
import { TEAMS } from "./worldcup";

const GAMMA = "https://gamma-api.polymarket.com";

export type Outcome = {
  label: string;
  price: number;
  question?: string;
  url?: string;
  volume?: number;
  liquidity?: number;
};
export type Market = {
  id: string;
  platform: "Polymarket";
  title: string;
  slug: string;
  url: string;
  category: string;
  outcomes: Outcome[];
  volume: number;
  liquidity: number;
  endDate?: string;
  image?: string;
  // computed
  heat: number;
  topOutcome?: Outcome;
};

// Curated set of football-relevant Polymarket event slugs to aggregate.
// More per-match / prop markets list automatically as the tournament nears.
const WC_EVENT_SLUGS = [
  "world-cup-winner",
  "will-any-2026-fifa-world-cup-game-scheduled-in-the-us-be-relocated-abroad",
  "world-cup-golden-boot",
  "world-cup-top-scorer",
  "fifa-world-cup-2026-winner",
];

async function getJSON(url: string, live = false) {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    // live 模式绕过数据缓存（供 /api/live 轮询），否则缓存 2 分钟
    ...(live ? { cache: "no-store" as RequestCache } : { next: { revalidate: 120 } }),
  });
  if (!res.ok) throw new Error(`Polymarket ${res.status}`);
  return res.json();
}

function parseArr(s: unknown): string[] {
  try {
    return typeof s === "string" ? JSON.parse(s) : (s as string[]) ?? [];
  } catch {
    return [];
  }
}

function eventToMarket(ev: any): Market {
  const mkts: any[] = ev.markets ?? [];
  const outcomes: Outcome[] = mkts
    .map((m) => {
      const labels = parseArr(m.outcomes);
      const prices = parseArr(m.outcomePrices).map(Number);
      const label = m.groupItemTitle || labels[0] || m.question || "—";
      return {
        label,
        price: prices[0] ?? 0,
        question: m.question,
        url: m.slug ? `https://polymarket.com/zh/event/${ev.slug}/${m.slug}` : `https://polymarket.com/zh/event/${ev.slug}`,
        volume: Number(m.volume ?? 0),
        liquidity: Number(m.liquidity ?? 0),
      };
    })
    .filter((o) => o.price > 0)
    .sort((a, b) => b.price - a.price);

  const volume = Number(ev.volume ?? 0);
  const liquidity = Number(ev.liquidity ?? 0);
  const vol24 = Number(ev.volume24hr ?? 0);
  // Heat: blend of 24h activity, total volume (log), liquidity, recency to close.
  const heat =
    0.45 * Math.min(1, vol24 / 5_000_000) +
    0.30 * Math.min(1, Math.log10(volume + 1) / 9) +
    0.15 * Math.min(1, liquidity / 2_000_000) +
    0.10 * 1;

  return {
    id: String(ev.id),
    platform: "Polymarket",
    title: (ev.title || "").trim(),
    slug: ev.slug,
    url: `https://polymarket.com/event/${ev.slug}`,
    category: "World Cup",
    outcomes,
    volume,
    liquidity,
    endDate: ev.endDate,
    image: ev.image,
    heat: Math.round(heat * 1000) / 10,
    topOutcome: outcomes[0],
  };
}

export async function getWorldCupMarkets(opts?: { live?: boolean }): Promise<Market[]> {
  const out: Market[] = [];
  const seen = new Set<string>();
  // 并行拉取所有 slug，整体延迟从 5 次串行降到 1 次往返
  const results = await Promise.allSettled(
    WC_EVENT_SLUGS.map((slug) => getJSON(`${GAMMA}/events?slug=${slug}`, opts?.live))
  );
  for (const r of results) {
    if (r.status !== "fulfilled") continue; // skip unavailable slug
    const events = Array.isArray(r.value) ? r.value : [r.value];
    for (const ev of events) {
      if (!ev || seen.has(String(ev.id))) continue;
      seen.add(String(ev.id));
      out.push(eventToMarket(ev));
    }
  }
  // Fallback discovery if curated slugs missed: search soccer tag.
  if (out.length === 0) {
    try {
      const data = await getJSON(
        `${GAMMA}/events?closed=false&limit=20&order=volume&ascending=false&tag=soccer`
      );
      for (const ev of data) {
        if (seen.has(String(ev.id))) continue;
        seen.add(String(ev.id));
        out.push(eventToMarket(ev));
      }
    } catch {
      /* ignore */
    }
  }
  return out.sort((a, b) => b.heat - a.heat);
}

// Polymarket implied probability vs our model's champion probability — surfaces
// potential value bets / mispricing without mixing in other venues.
export function divergenceSignals(
  market: Market,
  modelProb: (teamName: string) => number
) {
  return market.outcomes
    .map((o) => {
      const mp = modelProb(o.label);
      return {
        label: o.label,
        market: o.price,
        model: mp,
        edge: mp - o.price, // positive => model thinks underpriced
      };
    })
    .filter((d) => d.model > 0)
    .sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge));
}

export function teamNameSet(): Set<string> {
  return new Set(TEAMS.map((t) => t.name));
}

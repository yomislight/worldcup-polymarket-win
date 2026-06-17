const GAMMA = "https://gamma-api.polymarket.com";
const SLUGS = ["world-cup-winner", "fifa-world-cup-2026-winner"];
const KV_KEY = "polymarket:winner:v1";

function parseArr(s) {
  try { return typeof s === "string" ? JSON.parse(s) : s ?? []; }
  catch { return []; }
}

async function fetchOutcomes() {
  for (const slug of SLUGS) {
    const r = await fetch(`${GAMMA}/events?slug=${slug}`, {
      headers: { accept: "application/json" },
    });
    if (!r.ok) continue;
    const events = await r.json();
    for (const ev of Array.isArray(events) ? events : [events]) {
      const mkts = ev?.markets ?? [];
      const outcomes = mkts
        .map((m) => ({
          label: m.groupItemTitle || parseArr(m.outcomes)[0] || "?",
          price: parseFloat(parseArr(m.outcomePrices)[0] ?? "0"),
          url: m.slug ? `https://polymarket.com/zh/event/${ev.slug}/${m.slug}` : `https://polymarket.com/zh/event/${ev.slug}`,
        }))
        .filter((o) => o.price > 0.001)
        .sort((a, b) => b.price - a.price);
      if (outcomes.length >= 2) return { outcomes, slug };
    }
  }
  return null;
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil((async () => {
      const result = await fetchOutcomes();
      if (!result) { console.warn("[cron] no outcomes"); return; }
      await env.NEXT_INC_CACHE_KV.put(
        KV_KEY,
        JSON.stringify({ outcomes: result.outcomes, updatedAt: Date.now() }),
        { expirationTtl: 7200 }
      );
      console.log(`[cron] wrote ${result.outcomes.length} outcomes from ${result.slug}`);
    })());
  },

  async fetch(req, env) {
    const path = new URL(req.url).pathname;

    if (path === "/debug") {
      const result = await fetchOutcomes();
      return Response.json(result ? { count: result.outcomes.length, top5: result.outcomes.slice(0, 5) } : null);
    }

    try {
      const result = await fetchOutcomes();
      if (!result) return new Response("no outcomes found", { status: 500 });
      await env.NEXT_INC_CACHE_KV.put(
        KV_KEY,
        JSON.stringify({ outcomes: result.outcomes, updatedAt: Date.now() }),
        { expirationTtl: 7200 }
      );
      return new Response(`ok: wrote ${result.outcomes.length} outcomes`, { status: 200 });
    } catch (e) {
      return new Response(`error: ${e?.message ?? String(e)}`, { status: 500 });
    }
  },
};

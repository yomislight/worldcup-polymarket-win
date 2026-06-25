const GAMMA = "https://gamma-api.polymarket.com";
const SLUGS = ["world-cup-winner", "fifa-world-cup-2026-winner"];
const KV_ODDS = "polymarket:winner:v1";
const KV_RESULTS = "worldcup:results:v1";
const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

// ESPN abbreviation → our team code
const ESPN_TO_CODE = {
  MEX:"mx",RSA:"za",KOR:"kr",CZE:"cz",CAN:"ca",BIH:"ba",USA:"us",PAR:"py",
  QAT:"qa",SUI:"ch",BRA:"br",MAR:"ma",HAI:"ht",SCO:"gb-sct",AUS:"au",TUR:"tr",
  GER:"de",CUW:"cw",NED:"nl",JPN:"jp",CIV:"ci",ECU:"ec",SWE:"se",TUN:"tn",
  ESP:"es",CPV:"cv",BEL:"be",EGY:"eg",KSA:"sa",URU:"uy",IRN:"ir",NZL:"nz",
  FRA:"fr",SEN:"sn",IRQ:"iq",NOR:"no",ARG:"ar",ALG:"dz",AUT:"at",JOR:"jo",
  POR:"pt",COD:"cd",ENG:"gb-eng",CRO:"hr",GHA:"gh",PAN:"pa",UZB:"uz",COL:"co",
  MOR:"ma",SRB:"rs",MEA:"me",CHI:"cl",BOL:"bo",VEN:"ve",PER:"pe",
  CHN:"cn",THA:"th",IND:"in",IRE:"ie",WAL:"gb-wls",NIR:"gb-nir",ISL:"is",
  SVK:"sk",SVN:"si",HUN:"hu",ROU:"ro",BUL:"bg",GRE:"gr",CYP:"cy",
  NGA:"ng",CMR:"cm",MLI:"ml",ZIM:"zw",ZAM:"zm",TAN:"tz",UGA:"ug",
  KEN:"ke",ETH:"et",ANG:"ao",MOZ:"mz",MDG:"mg",RWA:"rw",SUD:"sd",
};

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

// Fetch results from ESPN for a range of past days
async function fetchResults(existingResults = []) {
  const existing = new Map(existingResults.map(r => [r.id, r]));
  const allResults = [...existingResults];

  // Fetch last 30 days + today to catch all played matches
  const dates = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10).replace(/-/g, ""));
  }

  for (const dateStr of dates) {
    try {
      const r = await fetch(`${ESPN}?dates=${dateStr}`);
      if (!r.ok) continue;
      const data = await r.json();
      const events = data?.events ?? [];

      for (const ev of events) {
        const status = ev?.status?.type;
        if (!status?.completed) continue;

        const comps = ev?.competitions?.[0]?.competitors ?? [];
        const home = comps.find(c => c.homeAway === "home") ?? comps[0];
        const away = comps.find(c => c.homeAway === "away") ?? comps[1];
        if (!home || !away) continue;

        const homeCode = ESPN_TO_CODE[home?.team?.abbreviation];
        const awayCode = ESPN_TO_CODE[away?.team?.abbreviation];
        if (!homeCode || !awayCode) continue;

        const homeScore = parseInt(home.score ?? "0", 10);
        const awayScore = parseInt(away.score ?? "0", 10);
        const winner = homeScore > awayScore ? "home" : awayScore > homeScore ? "away" : "draw";

        // Find matching match ID by team codes
        // We'll store by team pair since we don't have match IDs here
        const pairKey = `${homeCode}:${awayCode}`;
        const found = allResults.find(r => {
          const m = r._pairKey;
          return m === pairKey;
        });

        if (!found) {
          allResults.push({
            _pairKey: pairKey,
            homeCode, awayCode, homeScore, awayScore, winner, finished: true,
          });
        }
      }
    } catch {}
  }

  return allResults;
}

// Simpler approach: fetch today + recent days, store by team pair
async function fetchAndStoreResults(env) {
  // Load existing results from KV to merge
  let existing = [];
  try {
    existing = (await env.NEXT_INC_CACHE_KV.get(KV_RESULTS, "json")) ?? [];
  } catch {}

  // Build set of already-known team pairs
  const knownPairs = new Set(existing.map(r => `${r.homeCode}:${r.awayCode}`));
  const newResults = [...existing];

  // Fetch last 30 days from ESPN
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");

    try {
      const r = await fetch(`${ESPN}?dates=${dateStr}`);
      if (!r.ok) continue;
      const data = await r.json();

      for (const ev of data?.events ?? []) {
        if (!ev?.status?.type?.completed) continue;
        const comps = ev?.competitions?.[0]?.competitors ?? [];
        const home = comps.find(c => c.homeAway === "home") ?? comps[0];
        const away = comps.find(c => c.homeAway === "away") ?? comps[1];
        if (!home || !away) continue;

        const homeCode = ESPN_TO_CODE[home?.team?.abbreviation];
        const awayCode = ESPN_TO_CODE[away?.team?.abbreviation];
        if (!homeCode || !awayCode) continue;

        const pairKey = `${homeCode}:${awayCode}`;
        if (knownPairs.has(pairKey)) continue;

        const homeScore = parseInt(home.score ?? "0", 10);
        const awayScore = parseInt(away.score ?? "0", 10);
        newResults.push({
          homeCode, awayCode, homeScore, awayScore,
          winner: homeScore > awayScore ? "home" : awayScore > homeScore ? "away" : "draw",
          finished: true,
          date: d.toISOString().slice(0, 10),
        });
        knownPairs.add(pairKey);
      }
    } catch {}
  }

  return newResults;
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil((async () => {
      // Fetch Polymarket odds
      const oddsResult = await fetchOutcomes();
      if (oddsResult) {
        await env.NEXT_INC_CACHE_KV.put(
          KV_ODDS,
          JSON.stringify({ outcomes: oddsResult.outcomes, updatedAt: Date.now() }),
          { expirationTtl: 7200 }
        );
        console.log(`[cron] odds: wrote ${oddsResult.outcomes.length} outcomes`);
      }

      // Fetch match results from ESPN
      const results = await fetchAndStoreResults(env);
      await env.NEXT_INC_CACHE_KV.put(
        KV_RESULTS,
        JSON.stringify(results),
        { expirationTtl: 86400 * 7 }
      );
      console.log(`[cron] results: stored ${results.length} match results`);
    })());
  },

  async fetch(req, env) {
    const path = new URL(req.url).pathname;

    if (path === "/debug/results") {
      const results = await fetchAndStoreResults(env);
      return Response.json({ count: results.length, sample: results.slice(0, 5) });
    }

    if (path === "/debug") {
      const result = await fetchOutcomes();
      return Response.json(result ? { count: result.outcomes.length, top5: result.outcomes.slice(0, 5) } : null);
    }

    try {
      // Refresh both odds and results
      const [oddsResult, results] = await Promise.all([
        fetchOutcomes(),
        fetchAndStoreResults(env),
      ]);

      if (oddsResult) {
        await env.NEXT_INC_CACHE_KV.put(
          KV_ODDS,
          JSON.stringify({ outcomes: oddsResult.outcomes, updatedAt: Date.now() }),
          { expirationTtl: 7200 }
        );
      }
      await env.NEXT_INC_CACHE_KV.put(
        KV_RESULTS,
        JSON.stringify(results),
        { expirationTtl: 86400 * 7 }
      );

      return new Response(
        `ok: ${oddsResult?.outcomes.length ?? 0} odds, ${results.length} results`,
        { status: 200 }
      );
    } catch (e) {
      return new Response(`error: ${e?.message ?? String(e)}`, { status: 500 });
    }
  },
};

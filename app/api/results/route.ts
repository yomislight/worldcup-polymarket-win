import { getCloudflareContext } from "@opennextjs/cloudflare";
import { STATIC_RESULTS } from "@/lib/match-results";
import { MATCHES } from "@/lib/worldcup";

export const dynamic = "force-dynamic";

const KV_KEY = "worldcup:results:v1";

export type ResultEntry = {
  homeCode: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
  winner: "home" | "draw" | "away";
  finished: boolean;
  matchId?: string;
};

// Build static results enriched with homeCode/awayCode from MATCHES
function staticResults(): ResultEntry[] {
  return STATIC_RESULTS.map((r) => {
    const match = MATCHES.find((m) => m.id === r.id);
    return {
      matchId: r.id,
      homeCode: match?.home ?? "",
      awayCode: match?.away ?? "",
      homeScore: r.homeScore,
      awayScore: r.awayScore,
      winner: r.winner,
      finished: r.finished,
    };
  });
}

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const kv = (env as any).NEXT_INC_CACHE_KV;
    // KV stores results by team pair (from cron ESPN fetch)
    const kvResults = await kv.get(KV_KEY, "json");
    if (kvResults?.length) {
      // Merge KV results (team-pair based) with match IDs from static data
      const matched: ResultEntry[] = [];
      const static_ = staticResults();
      for (const r of kvResults) {
        // Try to find match ID from static data
        const staticMatch = static_.find(
          (s) => s.homeCode === r.homeCode && s.awayCode === r.awayCode
        );
        matched.push({ ...r, matchId: staticMatch?.matchId });
      }
      // Add any static results not covered by KV
      for (const s of static_) {
        if (!matched.find((m) => m.matchId === s.matchId)) matched.push(s);
      }
      return Response.json(matched, { headers: { "cache-control": "no-store" } });
    }
  } catch {}
  return Response.json(staticResults(), { headers: { "cache-control": "no-store" } });
}

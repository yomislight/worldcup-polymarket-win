// Lightweight prediction model. Elo-based 1X2 probabilities + champion odds.
import { TEAMS, Team, teamByCode } from "./worldcup";
import { playersByTeam } from "./players";
import { coachWinRate, getTeamInsight, recentGoalDiffPerMatch, recentPointsRate } from "./team-insights";

// Expected score for A vs B from Elo (no home advantage on neutral WC venues).
function expected(eloA: number, eloB: number): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

// Convert a two-way expected score into 1X2 with a draw carve-out.
export function matchProbabilities(homeCode: string, awayCode: string) {
  const h = teamByCode(homeCode);
  const a = teamByCode(awayCode);
  if (!h || !a) return { home: 0.4, draw: 0.25, away: 0.35 };
  const eH = expected(h.elo, a.elo);
  // Draw likelihood peaks when teams are evenly matched.
  const closeness = 1 - Math.abs(eH - 0.5) * 2; // 0..1
  const draw = 0.20 + 0.16 * closeness;
  const home = eH * (1 - draw);
  const away = (1 - eH) * (1 - draw);
  return { home, draw, away };
}

export type MatchProbabilities = ReturnType<typeof matchProbabilities>;

export type TeamFactorBreakdown = {
  elo: number;
  coach: number;
  recent: number;
  squad: number;
  total: number;
};

export type MarketTeamComparison = {
  code: string;
  marketChampion?: number;
  modelChampion: number;
  edge?: number;
};

export type GroupStageAnalysis = {
  base: MatchProbabilities;
  adjusted: MatchProbabilities;
  fairOdds: { home: number; draw: number; away: number };
  fairPrices: { home: number; draw: number; away: number };
  confidence: number;
  factors: {
    home: TeamFactorBreakdown;
    away: TeamFactorBreakdown;
  };
  market: {
    home: MarketTeamComparison;
    away: MarketTeamComparison;
  };
  readout: string[];
};

export function aiMatchProbabilities(homeCode: string, awayCode: string): MatchProbabilities {
  const h = teamByCode(homeCode);
  const a = teamByCode(awayCode);
  if (!h || !a) return matchProbabilities(homeCode, awayCode);
  return probabilitiesFromElo(adjustedElo(homeCode), adjustedElo(awayCode));
}

export function groupStageAnalysis(
  homeCode: string,
  awayCode: string,
  marketByCode = new Map<string, number>(),
): GroupStageAnalysis {
  const base = matchProbabilities(homeCode, awayCode);
  const adjusted = aiMatchProbabilities(homeCode, awayCode);
  const home = teamByCode(homeCode)!;
  const away = teamByCode(awayCode)!;
  const hInsight = getTeamInsight(homeCode);
  const aInsight = getTeamInsight(awayCode);
  const spread = Math.max(adjusted.home, adjusted.draw, adjusted.away) - Math.min(adjusted.home, adjusted.draw, adjusted.away);
  const marketHome = teamMarketComparison(homeCode, marketByCode);
  const marketAway = teamMarketComparison(awayCode, marketByCode);

  return {
    base,
    adjusted,
    fairOdds: {
      home: toDecimalOdds(adjusted.home),
      draw: toDecimalOdds(adjusted.draw),
      away: toDecimalOdds(adjusted.away),
    },
    fairPrices: {
      home: adjusted.home,
      draw: adjusted.draw,
      away: adjusted.away,
    },
    confidence: Math.min(0.96, 0.58 + spread * 0.46),
    factors: {
      home: teamFactorBreakdown(homeCode),
      away: teamFactorBreakdown(awayCode),
    },
    market: {
      home: marketHome,
      away: marketAway,
    },
    readout: [
      `${home.zh}：${hInsight.coach.name} 执教胜率 ${(coachWinRate(homeCode) * 100).toFixed(0)}%，近一年 ${hInsight.recent.wins}胜${hInsight.recent.draws}平${hInsight.recent.losses}负。`,
      `${away.zh}：${aInsight.coach.name} 执教胜率 ${(coachWinRate(awayCode) * 100).toFixed(0)}%，近一年 ${aInsight.recent.wins}胜${aInsight.recent.draws}平${aInsight.recent.losses}负。`,
      "Polymarket 当前可比价格主要来自世界杯冠军盘；这里用作球队市场热度/低估高估代理，不等同于本场小组赛 1X2 盘口。",
      marketSummary(home.zh, marketHome, away.zh, marketAway),
    ],
  };
}

export function adjustedElo(code: string): number {
  const team = teamByCode(code);
  if (!team) return 1700;
  const f = teamFactorBreakdown(code);
  return team.elo + f.total;
}

function teamFactorBreakdown(code: string): TeamFactorBreakdown {
  const team = teamByCode(code);
  if (!team) return { elo: 0, coach: 0, recent: 0, squad: 0, total: 0 };
  const coach = (coachWinRate(code) - 0.55) * 90;
  const recent = (recentPointsRate(code) - 0.55) * 120 + recentGoalDiffPerMatch(code) * 14;
  const squad = squadBoost(code);
  const total = Math.round(coach + recent + squad);
  return {
    elo: team.elo,
    coach: Math.round(coach),
    recent: Math.round(recent),
    squad: Math.round(squad),
    total,
  };
}

function squadBoost(code: string): number {
  const players = playersByTeam(code);
  if (!players.length) return 0;
  const avg = players.reduce((sum, p) => sum + p.rating, 0) / players.length;
  const peak = Math.max(...players.map((p) => p.rating));
  return (avg - 8.0) * 42 + (peak - 8.5) * 18;
}

function probabilitiesFromElo(eloA: number, eloB: number): MatchProbabilities {
  const eH = expected(eloA, eloB);
  const closeness = 1 - Math.abs(eH - 0.5) * 2;
  const draw = 0.19 + 0.15 * closeness;
  const home = eH * (1 - draw);
  const away = (1 - eH) * (1 - draw);
  return { home, draw, away };
}

function teamMarketComparison(code: string, marketByCode: Map<string, number>): MarketTeamComparison {
  const marketChampion = marketByCode.get(code);
  const modelChampion = modelChampionFor(code);
  return {
    code,
    marketChampion,
    modelChampion,
    edge: marketChampion === undefined ? undefined : modelChampion - marketChampion,
  };
}

function marketSummary(
  homeName: string,
  home: MarketTeamComparison,
  awayName: string,
  away: MarketTeamComparison,
): string {
  if (home.edge === undefined && away.edge === undefined) return "暂未匹配到双方的 Polymarket 冠军盘价格。";
  const h = home.edge === undefined ? `${homeName} 暂无市场价` : `${homeName} 冠军盘 ${pct(home.marketChampion!)}，模型 ${pct(home.modelChampion)}，edge ${signedPct(home.edge)}`;
  const a = away.edge === undefined ? `${awayName} 暂无市场价` : `${awayName} 冠军盘 ${pct(away.marketChampion!)}，模型 ${pct(away.modelChampion)}，edge ${signedPct(away.edge)}`;
  return `${h}；${a}。`;
}

function toDecimalOdds(prob: number): number {
  return prob > 0 ? 1 / prob : 99;
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function signedPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

// Most likely scoreline grid (Poisson on expected goals).
export function scoreMatrix(homeCode: string, awayCode: string) {
  const h = teamByCode(homeCode)!;
  const a = teamByCode(awayCode)!;
  const eH = expected(h.elo, a.elo);
  const lambdaH = 0.8 + eH * 2.0;
  const lambdaA = 0.8 + (1 - eH) * 2.0;
  const pois = (k: number, l: number) =>
    (Math.pow(l, k) * Math.exp(-l)) / factorial(k);
  const grid: { h: number; a: number; p: number }[] = [];
  for (let i = 0; i <= 4; i++)
    for (let j = 0; j <= 4; j++)
      grid.push({ h: i, a: j, p: pois(i, lambdaH) * pois(j, lambdaA) });
  return grid.sort((x, y) => y.p - x.p).slice(0, 4);
}
function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

// Model-implied champion probability via softmax over Elo (vs market).
export function championProbabilities(): { team: Team; prob: number }[] {
  const T = 110; // temperature
  const exps = TEAMS.map((t) => ({ t, e: Math.exp(t.elo / T) }));
  const sum = exps.reduce((s, x) => s + x.e, 0);
  return exps
    .map(({ t, e }) => ({ team: t, prob: e / sum }))
    .sort((a, b) => b.prob - a.prob);
}

export function modelChampionFor(code: string): number {
  return championProbabilities().find((c) => c.team.code === code)?.prob ?? 0;
}

// Given a finished match, return what the model predicted as the winner.
export function predictedWinner(
  homeCode: string,
  awayCode: string,
): "home" | "draw" | "away" {
  const p = aiMatchProbabilities(homeCode, awayCode);
  if (p.home >= p.draw && p.home >= p.away) return "home";
  if (p.away >= p.home && p.away >= p.draw) return "away";
  return "draw";
}

export type PredictionAccuracy = {
  correct: number;
  total: number;
  rate: number;
};

export function calcPredictionAccuracy(
  results: { homeCode: string; awayCode: string; winner: "home" | "draw" | "away" }[],
): PredictionAccuracy {
  let correct = 0;
  for (const r of results) {
    if (predictedWinner(r.homeCode, r.awayCode) === r.winner) correct++;
  }
  return { correct, total: results.length, rate: results.length ? correct / results.length : 0 };
}

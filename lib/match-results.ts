// Static seed results — overridden at runtime by /api/results (KV from cron).
// Cron auto-updates this via ESPN API every 10 min.

export type MatchResult = {
  id: string;
  homeScore: number;
  awayScore: number;
  winner: "home" | "draw" | "away";
  finished: boolean;
};

// Known results as of 2026-06-17. Cron keeps this up-to-date in KV.
export const STATIC_RESULTS: MatchResult[] = [
  { id: "m1",  homeScore: 2, awayScore: 0, winner: "home", finished: true },  // MEX 2-0 RSA
  { id: "m2",  homeScore: 2, awayScore: 1, winner: "home", finished: true },  // KOR 2-1 CZE
  { id: "m3",  homeScore: 1, awayScore: 1, winner: "draw", finished: true },  // CAN 1-1 BIH
  { id: "m4",  homeScore: 4, awayScore: 1, winner: "home", finished: true },  // USA 4-1 PAR
  { id: "m5",  homeScore: 0, awayScore: 1, winner: "away", finished: true },  // HAI 0-1 SCO
  { id: "m6",  homeScore: 2, awayScore: 0, winner: "home", finished: true },  // AUS 2-0 TUR
  { id: "m7",  homeScore: 1, awayScore: 1, winner: "draw", finished: true },  // BRA 1-1 MAR
  { id: "m8",  homeScore: 1, awayScore: 1, winner: "draw", finished: true },  // QAT 1-1 SUI
  { id: "m9",  homeScore: 1, awayScore: 0, winner: "home", finished: true },  // CIV 1-0 ECU
  { id: "m10", homeScore: 7, awayScore: 1, winner: "home", finished: true },  // GER 7-1 CUW
  { id: "m11", homeScore: 2, awayScore: 2, winner: "draw", finished: true },  // NED 2-2 JPN
  { id: "m12", homeScore: 5, awayScore: 1, winner: "home", finished: true },  // SWE 5-1 TUN
  { id: "m13", homeScore: 2, awayScore: 2, winner: "draw", finished: true },  // IRN 2-2 NZL
  { id: "m14", homeScore: 0, awayScore: 0, winner: "draw", finished: true },  // ESP 0-0 CPV
  { id: "m15", homeScore: 1, awayScore: 1, winner: "draw", finished: true },  // BEL 1-1 EGY
  { id: "m16", homeScore: 1, awayScore: 1, winner: "draw", finished: true },  // KSA 1-1 URU
  { id: "m17", homeScore: 3, awayScore: 1, winner: "home", finished: true },  // FRA 3-1 SEN
  { id: "m18", homeScore: 1, awayScore: 4, winner: "away", finished: true },  // IRQ 1-4 NOR
  { id: "m19", homeScore: 3, awayScore: 0, winner: "home", finished: true },  // ARG 3-0 ALG
  { id: "m20", homeScore: 3, awayScore: 1, winner: "home", finished: true },  // AUT 3-1 JOR
];

export function resultById(id: string): MatchResult | undefined {
  return STATIC_RESULTS.find((r) => r.id === id);
}

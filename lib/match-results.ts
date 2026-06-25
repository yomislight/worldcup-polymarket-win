import { MATCHES } from "./worldcup";

export type MatchResult = {
  id: string;
  homeScore: number;
  awayScore: number;
  winner: "home" | "draw" | "away";
  finished: boolean;
};

export const STATIC_RESULTS: MatchResult[] = MATCHES
  .filter((match) => match.status === "finished" && match.score)
  .map((match) => {
    const [homeScore, awayScore] = match.score!;
    return {
      id: match.id,
      homeScore,
      awayScore,
      winner: homeScore > awayScore ? "home" : homeScore < awayScore ? "away" : "draw",
      finished: true,
    };
  });

export function resultById(id: string): MatchResult | undefined {
  return STATIC_RESULTS.find((result) => result.id === id);
}

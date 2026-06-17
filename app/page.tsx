import { getWorldCupMarkets, divergenceSignals } from "@/lib/polymarket";
import { MarketCard } from "@/components/MarketCard";
import { SectionTitle, Flag } from "@/components/ui";
import { LiveWinnerTable } from "@/components/LiveWinnerTable";
import { modelChampionFor, championProbabilities, groupStageAnalysis, calcPredictionAccuracy } from "@/lib/model";
import { MATCHES, TEAMS } from "@/lib/worldcup";
import { STATIC_RESULTS } from "@/lib/match-results";
import { ScannerConsole } from "@/components/ScannerConsole";
import Link from "next/link";

export const dynamic = "force-static";
export const revalidate = false;

export default async function Home() {
  const markets = await getWorldCupMarkets();
  const winner = markets.find((m) => m.slug?.includes("winner")) ?? markets[0];

  const nameToCode = new Map(TEAMS.map((t) => [t.name, t.code]));
  const totalVol = markets.reduce((s, m) => s + m.volume, 0);
  const codeToTeam = new Map(TEAMS.map((t) => [t.code, t]));

  const marketByCode = new Map<string, number>();
  if (winner) {
    for (const outcome of winner.outcomes) {
      const code = nameToCode.get(outcome.label);
      if (code) marketByCode.set(code, outcome.price);
    }
  }

  // Compute AI prediction accuracy from finished match results
  const finishedWithCodes = STATIC_RESULTS.filter((r) => r.finished).map((r) => {
    const match = MATCHES.find((m) => m.id === r.id);
    return { homeCode: match?.home ?? "", awayCode: match?.away ?? "", winner: r.winner };
  }).filter((r) => r.homeCode && r.awayCode);
  const accuracy = calcPredictionAccuracy(finishedWithCodes);

  // IDs of already-finished matches
  const finishedIds = new Set(STATIC_RESULTS.filter((r) => r.finished).map((r) => r.id));

  // Pass next 20 non-finished matches so ScannerConsole can filter to today on client
  const upcomingMatches = [...MATCHES]
    .filter((m) => m.home && m.away && !finishedIds.has(m.id))
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff))
    .slice(0, 20)
    .map((m) => {
      const homeTeam = codeToTeam.get(m.home!)!;
      const awayTeam = codeToTeam.get(m.away!)!;
      if (!homeTeam || !awayTeam) return null;
      const analysis = groupStageAnalysis(m.home!, m.away!, marketByCode);
      return {
        id: m.id,
        stage: m.stage,
        group: m.group,
        kickoff: m.kickoff,
        venue: m.venue,
        city: m.city,
        home: {
          code: homeTeam.code,
          zh: homeTeam.zh,
          name: homeTeam.name,
          marketChampion: analysis.market.home.marketChampion,
          modelChampion: analysis.market.home.modelChampion,
          edge: analysis.market.home.edge,
        },
        away: {
          code: awayTeam.code,
          zh: awayTeam.zh,
          name: awayTeam.name,
          marketChampion: analysis.market.away.marketChampion,
          modelChampion: analysis.market.away.modelChampion,
          edge: analysis.market.away.edge,
        },
        aiProb: {
          home: analysis.adjusted.home,
          draw: analysis.adjusted.draw,
          away: analysis.adjusted.away,
        },
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  return (
    <div className="space-y-12">
      <ScannerConsole
        marketsCount={markets.length}
        totalVolume={totalVol}
        teamsCount={TEAMS.length}
        upcomingMatches={upcomingMatches}
        accuracy={accuracy}
      />

      {/* ---------- WINNER MARKET FOCUS ---------- */}
      {winner && (
        <section id="winner-market">
          <SectionTitle sub="AI 概率高于市场价：偏向买 YES；AI 概率低于市场价：偏向买 NO；差值小于 2pt 则观望">
            <span className="zen-text">总盘口分析</span> · 世界杯总冠军
          </SectionTitle>
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.45fr]">
            <div className="card p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-300">Polymarket 预测盘口</div>
              <h2 className="mt-2 text-2xl font-black text-white">{winner.title || "世界杯总冠军"}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                这里作为全站主盘口：用实时隐含概率、成交量、流动性和 AI 独立概率做差，输出冠军盘错价信号。
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat label="选项数" value={String(winner.outcomes.length)} />
                <MiniStat label="事件热度" value={`${winner.heat.toFixed(1)}`} />
                <MiniStat label="总成交" value={`$${abbr(winner.volume)}`} />
                <MiniStat label="流动性" value={`$${abbr(winner.liquidity)}`} />
              </div>
              {/* AI prediction accuracy summary */}
              {accuracy.total > 0 && (
                <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">AI 预测战绩</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{(accuracy.rate * 100).toFixed(0)}%</span>
                    <span className="text-sm text-slate-400">准确率 ({accuracy.correct}/{accuracy.total} 场)</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    基于已完赛 {accuracy.total} 场小组赛实际结果统计
                  </div>
                </div>
              )}
              <Link
                href="https://polymarket.com/zh/event/world-cup-winner/will-france-win-the-2026-fifa-world-cup-924"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-lg border border-emerald-400/30 px-3 py-2 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/10"
              >
                打开 Polymarket 总冠军盘口
              </Link>
            </div>

            <LiveWinnerTable
              fallbackUrl={winner.url}
              rows={winner.outcomes.slice(0, 10).map((o) => {
                const code = nameToCode.get(o.label);
                return {
                  label: o.label,
                  code,
                  price: o.price,
                  model: code ? modelChampionFor(code) : 0,
                  url: o.url,
                };
              })}
            />
          </div>
        </section>
      )}

      {/* ---------- HEAT BOARD ---------- */}
      <section id="heat">
        <SectionTitle sub="按热度（24h成交·总量·流动性·临场）排序，点击跳转原平台下注">
          热度排行榜
        </SectionTitle>
        {markets.length === 0 ? (
          <div className="card p-8 text-center text-slate-400">
            暂时无法从 Polymarket 拉取盘口，请稍后刷新。
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {markets.map((m, i) => (
              <MarketCard key={m.id} market={m} rank={i + 1} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- CHAMPION MODEL ---------- */}
      <section>
        <SectionTitle sub="基于 Elo 实力评分的自研夺冠概率模型">
          模型夺冠概率 Top 8
        </SectionTitle>
        <div className="card divide-y divide-white/5">
          {championProbabilities().slice(0, 8).map((c, i) => (
            <Link
              key={c.team.code}
              href={`/team/${c.team.code}`}
              className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-white/5"
            >
              <span className="heading w-6 text-lg text-white/40">{i + 1}</span>
              <Flag code={c.team.code} className="h-6 w-9" />
              <span className="flex-1 font-medium text-white">{c.team.zh} {c.team.name}</span>
              <div className="hidden h-2 w-40 overflow-hidden rounded-full bg-white/10 sm:block">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300"
                  style={{ width: `${c.prob * 100 * 4}%` }}
                />
              </div>
              <span className="w-14 text-right font-semibold tabular-nums text-gold-300">
                {(c.prob * 100).toFixed(1)}%
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className="mt-1 font-black tabular-nums text-white">{value}</div>
    </div>
  );
}

function abbr(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(Math.round(n));
}

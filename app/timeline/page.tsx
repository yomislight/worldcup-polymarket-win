export const dynamic = "force-static";
export const revalidate = false;

import { MATCHES, TEAMS, teamByCode } from "@/lib/worldcup";
import { groupStageAnalysis, predictedWinner, calcPredictionAccuracy } from "@/lib/model";
import { getWorldCupMarkets } from "@/lib/polymarket";
import { STATIC_RESULTS, resultById } from "@/lib/match-results";
import { Flag } from "@/components/ui";
import { Countdown } from "@/components/Countdown";
import Link from "next/link";

export default async function TimelinePage() {
  const markets = await getWorldCupMarkets();
  const winner = markets.find((market) => market.slug?.includes("winner")) ?? markets[0];
  const codeByName = new Map(TEAMS.map((team) => [team.name, team.code]));
  const marketByCode = new Map<string, number>();
  if (winner) {
    for (const outcome of winner.outcomes) {
      const code = codeByName.get(outcome.label);
      if (code) marketByCode.set(code, outcome.price);
    }
  }

  // Pre-compute prediction accuracy from finished matches
  const finishedWithCodes = STATIC_RESULTS.filter((r) => r.finished).map((r) => {
    const match = MATCHES.find((m) => m.id === r.id);
    return { homeCode: match?.home ?? "", awayCode: match?.away ?? "", winner: r.winner };
  }).filter((r) => r.homeCode && r.awayCode);
  const accuracy = calcPredictionAccuracy(finishedWithCodes);

  const scheduleMatches = [...MATCHES].sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  const groupMatches = scheduleMatches.filter((m) => m.stage === "Group");
  const byDay = new Map<string, typeof scheduleMatches>();
  for (const match of scheduleMatches) {
    const day = match.kickoff.slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(match);
  }

  const days = [...byDay.entries()];
  const final = MATCHES.find((m) => m.stage === "Final");
  const totalEdges = groupMatches.map((m) => {
    const p = groupStageAnalysis(m.home!, m.away!, marketByCode).adjusted;
    return Math.max(p.home, p.draw, p.away) - Math.min(p.home, p.draw, p.away);
  });
  const maxEdge = Math.max(...totalEdges);
  const finishedCount = STATIC_RESULTS.filter((r) => r.finished).length;

  return (
    <div className="space-y-6">
      <section className="zen-panel relative overflow-hidden rounded-2xl p-5 md:p-6">
        <div className="zen-scanline" aria-hidden />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.28em] text-emerald-300">赛程扫描仪</div>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white md:text-4xl">
              赛程时间线 <span className="zen-text">AI 队列</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              按比赛日扫描小组赛，结合倒计时、场馆、胜平负概率和模型分歧，快速定位最值得关注的赛程窗口。
            </p>
            <div className="mt-4 max-w-3xl rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-xs leading-relaxed text-slate-300">
              <span className="font-bold text-emerald-300">重点说明：</span>
              AI 小组赛胜率由 Elo、FIFA 排名、主教练胜率、近一年战绩、核心球员评分共同调整；
              Polymarket 当前可比项主要是"世界杯冠军盘"，页面用它作为球队市场热度和低估/高估代理，
              不是单场胜平负盘口。
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:w-[420px] sm:grid-cols-4">
            <ConsoleStat label="比赛日" value={String(days.length)} />
            <ConsoleStat label="已完赛" value={`${finishedCount}场`} />
            <ConsoleStat label="预测准确" value={`${accuracy.correct}/${accuracy.total}`} />
            <ConsoleStat label="准确率" value={`${(accuracy.rate * 100).toFixed(0)}%`} accent />
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="zen-panel sticky top-20 h-fit max-h-[calc(100vh-120px)] overflow-y-auto rounded-xl p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="mb-3 flex items-center justify-between">
            <span className="zen-text text-sm font-bold">扫描索引</span>
            <span className="live-dot h-2 w-2 rounded-full bg-emerald-300" />
          </div>
          <div className="space-y-2">
            {days.map(([day, matches], index) => {
              const dayFinished = matches.filter((m) => resultById(m.id)?.finished).length;
              return (
                <a
                  key={day}
                  href={`#day-${day}`}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-emerald-400/30 hover:bg-emerald-400/10"
                >
                  <span className="mono w-8 text-xs text-emerald-300">D{String(index + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-xs text-slate-300">{fmtDate(day)}</span>
                  {dayFinished > 0 ? (
                    <span className="mono text-[11px] text-emerald-400">{dayFinished}完</span>
                  ) : (
                    <span className="mono text-[11px] text-slate-500">{matches.length}场</span>
                  )}
                </a>
              );
            })}
          </div>
        </aside>

        <div className="space-y-5">
          {days.map(([day, matches], dayIndex) => {
            const dayFinishedCount = matches.filter((m) => resultById(m.id)?.finished).length;
            return (
              <section key={day} id={`day-${day}`} className="zen-panel scroll-mt-28 rounded-xl p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-400/15 pb-3">
                  <div>
                    <div className="mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
                      比赛日 {String(dayIndex + 1).padStart(2, "0")}
                    </div>
                    <h2 className="mt-1 text-xl font-black text-white">{fmtDate(day)}</h2>
                  </div>
                  {dayFinishedCount > 0 ? (
                    <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      {dayFinishedCount}/{matches.length} 场已完赛
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      {matches.length} 场赛程
                    </span>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {matches.map((match) => {
                    const home = match.home ? teamByCode(match.home) : undefined;
                    const away = match.away ? teamByCode(match.away) : undefined;
                    const canAnalyze = Boolean(home && away);
                    const analysis = canAnalyze ? groupStageAnalysis(match.home!, match.away!, marketByCode) : undefined;
                    const p = analysis?.adjusted;
                    const result = resultById(match.id);
                    const isFinished = result?.finished ?? false;
                    const aiPred = isFinished && match.home && match.away
                      ? predictedWinner(match.home, match.away)
                      : undefined;
                    const isPredCorrect = aiPred && result ? aiPred === result.winner : undefined;

                    const favorite =
                      p && home && away
                        ? p.home >= p.draw && p.home >= p.away
                          ? home.zh
                          : p.away >= p.home && p.away >= p.draw
                            ? away.zh
                            : "平局"
                        : "待定";
                    const confidence = p ? Math.max(p.home, p.draw, p.away) : 0;

                    return (
                      <Link
                        key={match.id}
                        href={`/match/${match.id}#ai-why`}
                        className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#07121b]/82 p-4 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.08]"
                      >
                        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-200">
                              {match.stage === "Group" ? `${match.group} 组` : stageLabel(match.stage)}
                            </span>
                            <span className="mono text-[11px] text-slate-500">{match.id.toUpperCase()}</span>
                          </div>
                          {isFinished ? (
                            <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                              已完赛
                            </span>
                          ) : (
                            <span className="mono text-xs text-emerald-300">
                              <Countdown to={match.kickoff} />
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <TeamCell code={home?.code} name={home?.zh ?? match.homeLabel ?? "TBD"} align="left" />
                          {isFinished && result ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="mono text-lg font-black text-white">
                                {result.homeScore} : {result.awayScore}
                              </span>
                              <span className="text-[9px] uppercase tracking-widest text-slate-500">终场</span>
                            </div>
                          ) : (
                            <span className="mono text-sm font-bold text-white/35">VS</span>
                          )}
                          <TeamCell code={away?.code} name={away?.zh ?? match.awayLabel ?? "TBD"} align="right" />
                        </div>

                        {/* AI prediction result badge for finished matches */}
                        {isFinished && aiPred !== undefined && result && (
                          <div className={`mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold
                            ${isPredCorrect
                              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                              : "border-rose-400/25 bg-rose-400/10 text-rose-300"}`}>
                            <span className="text-sm">{isPredCorrect ? "✓" : "✗"}</span>
                            <span>
                              AI 预测{isPredCorrect ? "正确" : "有误"} ·{" "}
                              预测<span className="font-bold">{winnerLabel(aiPred, home?.zh, away?.zh)}</span>
                              {!isPredCorrect && (
                                <> · 实际<span className="font-bold">{winnerLabel(result.winner, home?.zh, away?.zh)}</span></>
                              )}
                            </span>
                          </div>
                        )}

                        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-3">
                          <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
                            <span>AI 胜平负 · 公平赔率</span>
                            <span>倾向 {favorite} · {(confidence * 100).toFixed(0)}% · 点击看依据</span>
                          </div>
                          {analysis && p && home && away ? (
                            <>
                              <TripletBar home={p.home} draw={p.draw} away={p.away} />
                              <div className="mt-3 grid grid-cols-3 gap-2">
                                <OddsCell label={home.zh} value={analysis.fairOdds.home} />
                                <OddsCell label="平局" value={analysis.fairOdds.draw} />
                                <OddsCell label={away.zh} value={analysis.fairOdds.away} />
                              </div>
                            </>
                          ) : (
                            <div className="rounded-md border border-white/10 bg-[#07121b]/70 px-3 py-3 text-xs text-slate-500">
                              淘汰赛对阵尚未产生，待参赛队确定后自动启用 AI 胜率和盘口分歧分析。
                            </div>
                          )}
                        </div>

                        {analysis && home && away && (
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <MarketProxy label={home.zh} value={analysis.market.home.marketChampion} edge={analysis.market.home.edge} />
                            <MarketProxy label={away.zh} value={analysis.market.away.marketChampion} edge={analysis.market.away.edge} />
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                          <span className="truncate">{match.venue}</span>
                          <span className="shrink-0 text-slate-400">{match.city}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {final && (
            <section className="zen-panel rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.24em] text-emerald-300">决赛节点</div>
                  <div className="mt-1 text-lg font-black text-white">决赛 · {fmtDate(final.kickoff.slice(0, 10))}</div>
                  <div className="text-sm text-slate-500">{final.venue} · {final.city}</div>
                </div>
                <Link href={`/match/${final.id}`} className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15">
                  查看决赛节点
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function OddsCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-[#07121b]/70 px-2 py-1">
      <div className="truncate text-[10px] text-slate-500">{label}</div>
      <div className="mono text-xs font-bold text-emerald-300">{value.toFixed(2)}</div>
    </div>
  );
}

function MarketProxy({ label, value, edge }: { label: string; value?: number; edge?: number }) {
  const hasEdge = edge !== undefined;
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] px-2 py-2">
      <div className="truncate text-[10px] text-slate-500">{label} 冠军盘</div>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <span className="mono text-xs font-bold text-slate-200">{value === undefined ? "--" : `${(value * 100).toFixed(1)}%`}</span>
        <span className={`mono text-[11px] font-bold ${hasEdge && edge >= 0 ? "text-emerald-300" : "text-violet-200"}`}>
          {hasEdge ? `${edge >= 0 ? "+" : ""}${(edge * 100).toFixed(1)}%` : "n/a"}
        </span>
      </div>
    </div>
  );
}

function TeamCell({ code, name, align }: { code?: string; name: string; align: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${align === "right" ? "justify-end text-right" : ""}`}>
      {align === "left" && (code ? <Flag code={code} className="h-6 w-9" /> : <PlaceholderFlag />)}
      <span className="truncate text-sm font-semibold text-white">{name}</span>
      {align === "right" && (code ? <Flag code={code} className="h-6 w-9" /> : <PlaceholderFlag />)}
    </div>
  );
}

function PlaceholderFlag() {
  return <span className="h-6 w-9 rounded-[3px] border border-white/10 bg-white/[0.06]" />;
}

function TripletBar({ home, draw, away }: { home: number; draw: number; away: number }) {
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
        <div className="bg-emerald-400" style={{ width: `${home * 100}%` }} />
        <div className="bg-cyan-300" style={{ width: `${draw * 100}%` }} />
        <div className="bg-violet-300" style={{ width: `${away * 100}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-3 text-[11px]">
        <span className="text-emerald-300">主胜 {(home * 100).toFixed(0)}%</span>
        <span className="text-center text-cyan-200">平 {(draw * 100).toFixed(0)}%</span>
        <span className="text-right text-violet-200">客胜 {(away * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

function ConsoleStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
      <div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`mono mt-1 text-xl font-black ${accent ? "zen-text" : "text-white"}`}>{value}</div>
    </div>
  );
}

function winnerLabel(w: "home" | "draw" | "away", homeZh?: string, awayZh?: string): string {
  if (w === "draw") return "平局";
  if (w === "home") return homeZh ?? "主队";
  return awayZh ?? "客队";
}

function fmtDate(d: string): string {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" });
}

function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    "Round of 32": "32 强",
    "Round of 16": "16 强",
    Quarterfinal: "1/4 决赛",
    Semifinal: "半决赛",
    "Third place": "三四名",
    Final: "决赛",
  };
  return labels[stage] ?? stage;
}

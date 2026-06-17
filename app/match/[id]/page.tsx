import { MATCHES, TEAMS, matchById, teamByCode, headToHead, flag } from "@/lib/worldcup";

// force-static：104 场赛事页全部在构建时生成静态 HTML，直接放 CDN Assets，
// 首次加载 < 200ms。AI 战术分析由客户端组件懒加载（/api/ai/match/[id]），
// 不阻塞页面渲染，也不消耗 KV 写配额。
export const dynamic = "force-static";
export function generateStaticParams() {
  return MATCHES.map((m) => ({ id: m.id }));
}
import { groupStageAnalysis, matchProbabilities, scoreMatrix } from "@/lib/model";
import { playersByTeam, playerPhoto } from "@/lib/players";
import { ProbBar, Flag, SectionTitle, Stat } from "@/components/ui";
import { Countdown } from "@/components/Countdown";
import { formMarks, getTeamInsight } from "@/lib/team-insights";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = matchById(id);
  if (!m) return notFound();
  if (!m.home || !m.away) return <BracketMatchPage match={m} />;
  const h = teamByCode(m.home)!;
  const a = teamByCode(m.away)!;
  const base = matchProbabilities(m.home, m.away);
  // 不传市场数据（force-static 不能发网络请求），WhyTeamCard 会显示"暂无匹配"
  const analysis = groupStageAnalysis(m.home, m.away);
  const p = analysis.adjusted;
  const scores = scoreMatrix(m.home, m.away);
  const h2h = headToHead(m.home, m.away);
  const hInsight = getTeamInsight(h.code);
  const aInsight = getTeamInsight(a.code);

  return (
    <div className="space-y-8">
      {/* hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 pitch-stripes p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-electric/10 via-transparent to-flame/10" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-slate-300">
            <span className="chip bg-white/10">小组赛 {m.group}组</span>
            <span>·</span>
            <Countdown to={m.kickoff} />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <TeamSide team={h} align="right" />
            <div className="text-center">
              <div className="heading text-4xl gold-text">VS</div>
              <div className="mt-2 text-xs text-slate-400">{m.venue}</div>
              <div className="text-xs text-slate-500">{m.city}</div>
            </div>
            <TeamSide team={a} align="left" />
          </div>
          <div className="mx-auto mt-6 max-w-lg">
            <div className="mb-1 text-center text-xs uppercase tracking-widest text-slate-400">
              AI 调整胜率预测
            </div>
            <ProbBar home={p.home} draw={p.draw} away={p.away} labels={[h.zh, "平局", a.zh]} />
          </div>
        </div>
      </section>

      <section className="zen-panel rounded-2xl p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-emerald-400/15 pb-3">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.26em] text-emerald-300">AI 市场速览</div>
            <h2 className="mt-1 text-2xl font-black text-white">AI 胜率 / 公平赔率 / Polymarket 对比</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              本场仅分析小组赛胜平负。Polymarket 当前对比项来自世界杯冠军盘，用于衡量双方在市场里的整体热度和低估/高估，不等同于本场单场赔率。
            </p>
          </div>
          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
            置信度 {(analysis.confidence * 100).toFixed(0)}%
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-xl border border-white/10 bg-[#07121b]/80 p-4">
            <div className="mb-3 text-sm font-bold text-white">模型变化</div>
            <CompareRow label={h.zh} base={base.home} adjusted={p.home} odds={analysis.fairOdds.home} />
            <CompareRow label="平局" base={base.draw} adjusted={p.draw} odds={analysis.fairOdds.draw} />
            <CompareRow label={a.zh} base={base.away} adjusted={p.away} odds={analysis.fairOdds.away} />
          </div>

          <div className="rounded-xl border border-white/10 bg-[#07121b]/80 p-4">
            <div className="mb-3 text-sm font-bold text-white">重点说明内容</div>
            <div className="space-y-2">
              {analysis.readout.map((line) => (
                <p key={line} className="text-xs leading-relaxed text-slate-300">
                  <span className="mr-2 text-emerald-300">▸</span>{line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="ai-why" className="zen-panel scroll-mt-28 rounded-2xl p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-emerald-400/15 pb-3">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.26em] text-emerald-300">胜率分析依据</div>
            <h2 className="mt-1 text-2xl font-black text-white">为什么倾向 {winnerName(h, a, p)}</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              这个胜率不是外部盘口，而是 JMWL 的本地模型：先用双方 Elo 算基础胜平负，再用教练胜率、近一年状态和球员池强度调整，最后展示 Polymarket 冠军盘作为市场热度代理。
            </p>
          </div>
          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
            {h.zh} {(p.home * 100).toFixed(0)}% · 平 {(p.draw * 100).toFixed(0)}% · {a.zh} {(p.away * 100).toFixed(0)}%
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <WhyTeamCard
            label={h.zh}
            teamCode={h.code}
            base={base.home}
            adjusted={p.home}
            factors={analysis.factors.home}
            market={analysis.market.home.marketChampion}
            edge={analysis.market.home.edge}
          />
          <WhyTeamCard
            label={a.zh}
            teamCode={a.code}
            base={base.away}
            adjusted={p.away}
            factors={analysis.factors.away}
            market={analysis.market.away.marketChampion}
            edge={analysis.market.away.edge}
          />
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-[#07121b]/80 p-4">
          <div className="mb-3 text-sm font-bold text-white">模型路径</div>
          <div className="grid gap-3 md:grid-cols-4">
            <ReasonStep title="1. 基础实力" body={`Elo 先给出 ${h.zh} ${(base.home * 100).toFixed(1)}%、平 ${(base.draw * 100).toFixed(1)}%、${a.zh} ${(base.away * 100).toFixed(1)}%。`} />
            <ReasonStep title="2. 教练/近况" body="教练胜率、近一年胜平负、进失球差会转成 Elo 修正值。" />
            <ReasonStep title="3. 球员池" body="该队球员评分均值和最高分会影响 squad boost，核心越强越加权。" />
            <ReasonStep title="4. 市场对照" body="Polymarket 当前只作为冠军盘热度/低估高估代理，不当作本场胜平负盘口。" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <CoachAndForm team={h} insight={hInsight} />
        <CoachAndForm team={a} insight={aInsight} />
      </div>

      {/* score predictions + form */}
      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <SectionTitle sub="泊松模型最可能比分">⚽ 比分预测</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {scores.map((s, i) => (
              <div key={i} className="card flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <Flag code={h.code} className="h-5 w-7" />
                  <span className="heading text-2xl text-white">
                    {s.h} - {s.a}
                  </span>
                  <Flag code={a.code} className="h-5 w-7" />
                </div>
                <span className="font-semibold text-gold-300">
                  {(s.p * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="FIFA排名" value={`#${h.fifaRank}`} />
            <Stat label="实力评分(Elo)" value={String(Math.max(h.elo, a.elo))} accent />
            <Stat label="FIFA排名" value={`#${a.fifaRank}`} />
          </div>
        </section>

        <section>
          <SectionTitle sub="近期交锋记录（示例）">📊 历史交锋 H2H</SectionTitle>
          <div className="card divide-y divide-white/5">
            {h2h.map((g, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-400">{g.date}</span>
                <span className="heading text-xl text-white">{g.score}</span>
                <span className="text-xs text-slate-500">{g.comp}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* squads */}
      <section>
        <SectionTitle sub="点击球员查看详细数据、打法与评分">🌟 双方核心球员</SectionTitle>
        <div className="grid gap-6 md:grid-cols-2">
          {[h, a].map((t) => {
            const ps = playersByTeam(t.code);
            return (
              <div key={t.code} className="card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Flag code={t.code} className="h-6 w-9" />
                  <span className="font-semibold text-white">{t.zh}</span>
                </div>
                {ps.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">球员数据待接入</p>
                ) : (
                  <div className="space-y-2">
                    {ps.slice(0, 8).map((pl) => (
                      <Link
                        key={pl.id}
                        href={`/player/${pl.id}`}
                        className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={playerPhoto(pl)}
                          alt={pl.name}
                          className="h-10 w-10 rounded-full bg-pitch-700 object-cover"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{pl.zh}</div>
                          <div className="text-xs text-slate-400">
                            {pl.position} · #{pl.number}
                          </div>
                        </div>
                        <span className="rounded-lg bg-gold-400/15 px-2 py-1 text-sm font-bold text-gold-300">
                          {pl.rating.toFixed(1)}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="text-center">
        <Link href="/timeline" className="text-sm text-slate-400 hover:text-gold-300">
          ← 返回时间线
        </Link>
      </div>
    </div>
  );
}

function winnerName(
  home: NonNullable<ReturnType<typeof teamByCode>>,
  away: NonNullable<ReturnType<typeof teamByCode>>,
  p: { home: number; draw: number; away: number },
) {
  if (p.draw >= p.home && p.draw >= p.away) return "平局";
  return p.home >= p.away ? home.zh : away.zh;
}

function WhyTeamCard({
  label,
  teamCode,
  base,
  adjusted,
  factors,
  market,
  edge,
}: {
  label: string;
  teamCode: string;
  base: number;
  adjusted: number;
  factors: { elo: number; coach: number; recent: number; squad: number; total: number };
  market?: number;
  edge?: number;
}) {
  const delta = adjusted - base;
  return (
    <div className="rounded-xl border border-white/10 bg-[#07121b]/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flag code={teamCode} className="h-5 w-7" />
          <span className="font-black text-white">{label}</span>
        </div>
        <span className="mono text-lg font-black text-emerald-300">{(adjusted * 100).toFixed(1)}%</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MiniStat label="基础胜率" value={`${(base * 100).toFixed(1)}%`} />
        <MiniStat label="调整变化" value={`${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1)}pt`} accent={delta >= 0} />
        <MiniStat label="教练修正" value={`${factors.coach >= 0 ? "+" : ""}${factors.coach}`} />
        <MiniStat label="近况修正" value={`${factors.recent >= 0 ? "+" : ""}${factors.recent}`} />
        <MiniStat label="球员池修正" value={`${factors.squad >= 0 ? "+" : ""}${factors.squad}`} />
        <MiniStat label="总修正 Elo" value={`${factors.total >= 0 ? "+" : ""}${factors.total}`} accent={factors.total >= 0} />
      </div>
      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
        <div className="text-[10px] uppercase tracking-widest text-slate-500">Polymarket 冠军盘代理</div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="mono text-sm font-bold text-slate-200">{market === undefined ? "暂无匹配" : `${(market * 100).toFixed(1)}%`}</span>
          <span className={`mono text-xs font-bold ${edge !== undefined && edge >= 0 ? "text-emerald-300" : "text-violet-200"}`}>
            {edge === undefined ? "n/a" : `${edge >= 0 ? "+" : ""}${(edge * 100).toFixed(1)}%`}
          </span>
        </div>
      </div>
    </div>
  );
}

function ReasonStep({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
      <div className="text-xs font-bold text-emerald-300">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-slate-400">{body}</div>
    </div>
  );
}

function BracketMatchPage({ match }: { match: NonNullable<ReturnType<typeof matchById>> }) {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 pitch-stripes p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-electric/10 via-transparent to-flame/10" />
        <div className="relative text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-slate-300">
            <span className="chip bg-white/10">{stageLabel(match.stage)}</span>
            <span>·</span>
            <Countdown to={match.kickoff} />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <BracketSide label={match.homeLabel ?? "TBD"} />
            <div>
              <div className="heading text-4xl gold-text">VS</div>
              <div className="mt-2 text-xs text-slate-400">{match.venue}</div>
              <div className="text-xs text-slate-500">{match.city}</div>
            </div>
            <BracketSide label={match.awayLabel ?? "TBD"} />
          </div>
        </div>
      </section>

      <section className="zen-panel rounded-2xl p-5">
        <div className="mono text-[11px] uppercase tracking-[0.26em] text-emerald-300">对阵节点</div>
        <h2 className="mt-1 text-2xl font-black text-white">淘汰赛对阵待产生</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
          这场比赛已纳入完整 104 场时间线，但双方参赛队要等前序比赛结果产生后才能确定。
          球队确定后，这里会自动启用 AI 胜平负、公平赔率、Polymarket 冠军盘对比和球员对位分析。
        </p>
      </section>

      <div className="text-center">
        <Link href="/timeline" className="text-sm text-slate-400 hover:text-gold-300">
          ← 返回时间线
        </Link>
      </div>
    </div>
  );
}

function BracketSide({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="grid h-16 w-24 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-xs text-slate-400 shadow-card">
        TBD
      </span>
      <div className="heading text-xl text-white">{label}</div>
    </div>
  );
}

function TeamSide({ team, align }: { team: ReturnType<typeof teamByCode>; align: "left" | "right" }) {
  if (!team) return null;
  return (
    <Link
      href={`/team/${team.code}`}
      className={`flex flex-col items-center gap-2 ${align === "right" ? "md:items-end" : "md:items-start"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={flag(team.code)} alt={team.name} className="h-16 w-24 rounded-lg object-cover shadow-card" />
      <div className="text-center">
        <div className="heading text-2xl text-white">{team.zh}</div>
        <div className="text-xs text-slate-400">{team.name}</div>
      </div>
    </Link>
  );
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

function CompareRow({ label, base, adjusted, odds }: { label: string; base: number; adjusted: number; odds: number }) {
  const delta = adjusted - base;
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="mono text-emerald-300">{(adjusted * 100).toFixed(1)}% · fair {odds.toFixed(2)}</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
        <div className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" style={{ width: `${adjusted * 100}%` }} />
      </div>
      <div className={`mono mt-1 text-[10px] ${delta >= 0 ? "text-emerald-300" : "text-violet-200"}`}>
        vs base {delta >= 0 ? "+" : ""}{(delta * 100).toFixed(1)}pt
      </div>
    </div>
  );
}

function CoachAndForm({
  team,
  insight,
}: {
  team: NonNullable<ReturnType<typeof teamByCode>>;
  insight: ReturnType<typeof getTeamInsight>;
}) {
  const coach = insight.coach;
  const winRate = coach.matches ? coach.wins / coach.matches : 0;
  return (
    <section className="zen-panel rounded-xl p-4">
      <div className="mb-4 flex items-center gap-3 border-b border-emerald-400/15 pb-3">
        <Flag code={team.code} className="h-7 w-10" />
        <div>
          <div className="text-lg font-black text-white">{team.zh}</div>
          <div className="text-xs text-slate-500">主教练与近期状态</div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="text-sm font-bold text-white">{coach.name}</div>
          <div className="mt-1 text-xs text-slate-400">上任 {coach.appointed} · {coach.previous.slice(0, 2).join(" / ")}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {coach.honors.slice(0, 2).map((honor) => (
              <span key={honor} className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2 py-0.5 text-[10px] text-emerald-200">
                {honor}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right">
          <MiniStat label="胜率" value={`${(winRate * 100).toFixed(0)}%`} />
          <MiniStat label="战绩" value={`${coach.wins}-${coach.draws}-${coach.losses}`} />
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">{insight.recent.period}战绩</span>
          <span className="mono text-xs text-emerald-300">
            {insight.recent.wins}W {insight.recent.draws}D {insight.recent.losses}L · {insight.recent.goalsFor}:{insight.recent.goalsAgainst}
          </span>
        </div>
        <div className="mb-3 flex gap-1.5">
          {formMarks(team.code).map((mark, index) => (
            <span key={`${mark}-${index}`} className={`grid h-6 w-6 place-items-center rounded text-[10px] font-black ${mark === "W" ? "bg-emerald-400/20 text-emerald-300" : mark === "D" ? "bg-cyan-300/15 text-cyan-200" : "bg-violet-300/15 text-violet-200"}`}>
              {mark}
            </span>
          ))}
        </div>
        <div className="space-y-1">
          {insight.recent.matches.map((match) => (
            <div key={`${team.code}-${match.date}-${match.opponent}`} className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>{match.date} · {match.opponent}</span>
              <span className="mono text-slate-200">{match.result} {match.score}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2">
      <div className="mono text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mono text-sm font-bold ${accent ? "text-emerald-300" : "text-slate-200"}`}>{value}</div>
    </div>
  );
}

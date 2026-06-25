import { TEAMS, teamByCode, teamsInGroup, flag, MATCHES } from "@/lib/worldcup";

export const dynamic = "force-static";
export const revalidate = false;
export function generateStaticParams() {
  return TEAMS.map((t) => ({ code: t.code }));
}
import { modelChampionFor } from "@/lib/model";
import { playersByTeam, playerPhoto } from "@/lib/players";
import { SectionTitle, Flag, Stat } from "@/components/ui";
import { formMarks, getTeamInsight } from "@/lib/team-insights";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TeamPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const t = teamByCode(code);
  if (!t) return notFound();
  const players = playersByTeam(t.code);
  const groupMates = teamsInGroup(t.group);
  const fixtures = MATCHES.filter((m) => m.home === t.code || m.away === t.code);
  const insight = getTeamInsight(t.code);
  const form = formMarks(t.code);
  const coach = insight.coach;
  const coachWinRate = coach.matches ? coach.wins / coach.matches : 0;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 p-8 pitch-stripes">
        <div className="absolute inset-0 bg-gradient-to-br from-pitch-600/50 to-pitch-900" />
        <div className="relative flex flex-wrap items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flag(t.code)} alt={t.name} className="h-24 w-36 rounded-xl object-cover shadow-card" />
          <div>
            <h1 className="heading text-5xl text-white">{t.zh}</h1>
            <p className="text-slate-300">{t.name} · {t.confederation}</p>
            <div className="mt-2 flex gap-1.5">
              {form.map((f, i) => (
                <span
                  key={i}
                  className={`grid h-6 w-6 place-items-center rounded text-xs font-bold ${
                    f === "W" ? "bg-electric/20 text-electric" : f === "D" ? "bg-slate-500/30 text-slate-300" : "bg-flame/20 text-flame"
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div className="ml-auto grid grid-cols-3 gap-2">
            <Stat label="FIFA排名" value={`#${t.fifaRank}`} />
            <Stat label="Elo评分" value={String(t.elo)} />
            <Stat label="夺冠概率" value={`${(modelChampionFor(t.code) * 100).toFixed(1)}%`} accent />
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <SectionTitle sub="点击查看球员打法雷达与评分">🌟 阵容核心</SectionTitle>
          {players.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">该队球员数据待接入真实 API</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {players.map((p) => (
                <Link key={p.id} href={`/player/${p.id}`} className="card flex items-center gap-3 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={playerPhoto(p)} alt={p.name} className="h-14 w-14 rounded-full bg-pitch-700 object-cover" />
                  <div className="flex-1">
                    <div className="font-semibold text-white">{p.zh}</div>
                    <div className="text-xs text-slate-400">{p.position} · #{p.number} · {p.club}</div>
                  </div>
                  <span className="rounded-lg bg-gold-400/15 px-2 py-1 font-bold text-gold-300">{p.rating.toFixed(1)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section>
            <SectionTitle>主教练情报</SectionTitle>
            <div className="zen-panel rounded-xl p-4">
              <div className="mb-3 border-b border-emerald-400/15 pb-3">
                <div className="text-lg font-black text-white">{coach.name}</div>
                <div className="mt-1 text-xs text-slate-400">上任 {coach.appointed} · {coach.previous.slice(0, 2).join(" / ")}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <CoachMetric label="执教胜率" value={`${(coachWinRate * 100).toFixed(0)}%`} />
                <CoachMetric label="总战绩" value={`${coach.wins}-${coach.draws}-${coach.losses}`} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {coach.honors.slice(0, 3).map((honor) => (
                  <span key={honor} className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2 py-0.5 text-[10px] text-emerald-200">
                    {honor}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>近一年战绩</SectionTitle>
            <div className="zen-panel rounded-xl p-4">
              <div className="mb-3 flex items-center justify-between border-b border-emerald-400/15 pb-3">
                <div className="flex gap-1.5">
                  {form.map((mark, index) => (
                    <span key={`${mark}-${index}`} className={`grid h-6 w-6 place-items-center rounded text-[10px] font-black ${mark === "W" ? "bg-emerald-400/20 text-emerald-300" : mark === "D" ? "bg-cyan-300/15 text-cyan-200" : "bg-violet-300/15 text-violet-200"}`}>
                      {mark}
                    </span>
                  ))}
                </div>
                <span className="mono text-xs text-emerald-300">
                  {insight.recent.wins}W {insight.recent.draws}D {insight.recent.losses}L
                </span>
              </div>
              <div className="space-y-2">
                {insight.recent.matches.map((m) => (
                  <div key={`${m.date}-${m.opponent}`} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-400">{m.date} · {m.opponent}</span>
                    <span className="mono font-bold text-slate-200">{m.result} {m.score}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                这组战绩进入 AI 小组赛模型，用来调整基础 Elo 和公平赔率。
              </p>
            </div>
          </section>

          <section>
            <SectionTitle>📋 {t.group}组对手</SectionTitle>
            <div className="card divide-y divide-white/5">
              {groupMates.map((gm) => (
                <Link key={gm.code} href={`/team/${gm.code}`} className={`flex items-center gap-2 px-4 py-2.5 transition hover:bg-white/5 ${gm.code === t.code ? "bg-gold-400/10" : ""}`}>
                  <Flag code={gm.code} className="h-5 w-7" />
                  <span className="flex-1 text-sm text-white">{gm.zh}</span>
                  <span className="text-xs text-slate-400">#{gm.fifaRank}</span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>⚽ 赛程</SectionTitle>
            <div className="card divide-y divide-white/5">
              {fixtures.filter((f) => f.home && f.away).map((f) => {
                const oppCode = f.home === t.code ? f.away! : f.home!;
                const opp = teamByCode(oppCode)!;
                const score = f.score ? `${f.score[0]}-${f.score[1]}` : undefined;
                return (
                  <Link key={f.id} href={`/match/${f.id}`} className="flex items-center gap-2 px-4 py-2.5 transition hover:bg-white/5">
                    <Flag code={opp.code} className="h-5 w-7" />
                    <span className="flex-1 text-sm text-white">vs {opp.zh}</span>
                    <span className={`mono text-xs ${score ? "font-bold text-gold-300" : "text-slate-400"}`}>
                      {score ? `FT ${score}` : f.kickoff.slice(5, 10)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function CoachMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2">
      <div className="mono text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mono text-sm font-bold text-emerald-300">{value}</div>
    </div>
  );
}

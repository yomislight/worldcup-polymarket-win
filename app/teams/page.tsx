import { GROUPS, teamsInGroup, flag } from "@/lib/worldcup";
import { modelChampionFor } from "@/lib/model";
import { formMarks, getTeamInsight } from "@/lib/team-insights";
import Link from "next/link";

export const dynamic = "force-static";
export const revalidate = false;

export default function TeamsPage() {
  const groups = GROUPS.map((group) => {
    const teams = teamsInGroup(group);
    const avgElo = Math.round(teams.reduce((sum, team) => sum + team.elo, 0) / teams.length);
    const favorite = teams[0];
    const totalModelProb = teams.reduce((sum, team) => sum + modelChampionFor(team.code), 0);
    return { group, teams, avgElo, favorite, totalModelProb };
  });

  const strongest = groups.reduce((best, item) => (item.avgElo > best.avgElo ? item : best), groups[0]);
  const highestProb = Math.max(...groups.flatMap((item) => item.teams.map((team) => modelChampionFor(team.code))));

  return (
    <div className="space-y-6">
      <section className="zen-panel relative overflow-hidden rounded-2xl p-5 md:p-6">
        <div className="zen-scanline" aria-hidden />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_440px] lg:items-end">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.28em] text-emerald-300">球队矩阵</div>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white md:text-4xl">
              球队 <span className="zen-text">小组雷达</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              按小组读取球队池，用 Elo 强度、FIFA 排名和模型夺冠概率生成小组雷达，点击球队进入完整档案。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ConsoleStat label="小组" value={String(GROUPS.length)} />
            <ConsoleStat label="球队" value={String(groups.reduce((sum, item) => sum + item.teams.length, 0))} />
            <ConsoleStat label="最强组" value={`${strongest.group}组`} accent />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map(({ group, teams, avgElo, favorite, totalModelProb }) => {
          const groupMaxProb = Math.max(...teams.map((team) => modelChampionFor(team.code)));
          return (
            <section key={group} className="zen-panel relative overflow-hidden rounded-xl p-4">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-emerald-400/15 pb-3">
                <div className="flex items-center gap-3">
                  <span className="mono grid h-11 w-11 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-xl font-black text-emerald-300">
                    {group}
                  </span>
                  <div>
                    <div className="text-lg font-black text-white">{group} 组扫描</div>
                    <div className="text-xs text-slate-500">
                      首选球队: <span className="text-slate-300">{favorite.zh}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-right">
                  <SmallStat label="平均 ELO" value={String(avgElo)} />
                  <SmallStat label="模型总胜率" value={`${(totalModelProb * 100).toFixed(1)}%`} />
                </div>
              </div>

              <div className="space-y-2">
                {teams.map((team, index) => {
                  const modelProb = modelChampionFor(team.code);
                  const insight = getTeamInsight(team.code);
                  return (
                    <Link
                      key={team.code}
                      href={`/team/${team.code}`}
                      className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-[#07121b]/80 p-3 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.08]"
                    >
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={flag(team.code)} alt="" className="h-9 w-12 rounded-md object-cover ring-1 ring-white/10" />
                        <span className="mono absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded bg-[#0b1322] text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/25">
                          {index + 1}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-bold text-white group-hover:text-emerald-200">{team.zh}</span>
                          <span className="mono text-[10px] uppercase text-slate-500">{team.confederation}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          <span className="truncate">主教练: {insight.coach.name}</span>
                          <span className="flex gap-1">
                            {formMarks(team.code).slice(0, 3).map((mark, markIndex) => (
                              <span key={`${mark}-${markIndex}`} className={mark === "W" ? "text-emerald-300" : mark === "D" ? "text-cyan-200" : "text-violet-200"}>
                                {mark}
                              </span>
                            ))}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300"
                              style={{ width: `${Math.max(8, (modelProb / Math.max(groupMaxProb, highestProb * 0.45)) * 100)}%` }}
                            />
                          </div>
                          <span className="mono w-14 text-right text-[11px] font-bold text-emerald-300">
                            {(modelProb * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="grid w-[86px] grid-cols-2 gap-1 text-right">
                        <MiniMetric label="排名" value={`#${team.fifaRank}`} />
                        <MiniMetric label="ELO" value={String(team.elo)} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
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

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5">
      <div className="mono text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mono text-sm font-bold text-emerald-300">{value}</div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono text-[9px] uppercase text-slate-500">{label}</div>
      <div className="mono text-xs font-bold text-slate-200">{value}</div>
    </div>
  );
}

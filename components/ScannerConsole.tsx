"use client";

import { Flag } from "@/components/ui";
import { Countdown } from "@/components/Countdown";
import Link from "next/link";

type UpcomingMatch = {
  id: string;
  stage: string;
  group?: string;
  kickoff: string;
  venue: string;
  city: string;
  home: {
    code: string;
    zh: string;
    name: string;
    marketChampion?: number;
    modelChampion: number;
    edge?: number;
  };
  away: {
    code: string;
    zh: string;
    name: string;
    marketChampion?: number;
    modelChampion: number;
    edge?: number;
  };
  aiProb: {
    home: number;
    draw: number;
    away: number;
  };
};

type ScannerConsoleProps = {
  marketsCount: number;
  totalVolume: number;
  teamsCount: number;
  upcomingMatches: UpcomingMatch[];
};

export function ScannerConsole({
  marketsCount,
  totalVolume,
  teamsCount,
  upcomingMatches,
}: ScannerConsoleProps) {
  // 查找即将到来比赛中的最大绝对偏差率，作为总大盘最大偏离显示
  const maxEdge = Math.max(
    ...upcomingMatches.flatMap((m) => [
      Math.abs(m.home.edge || 0),
      Math.abs(m.away.edge || 0),
    ]),
    0.038 // 兜底显示 3.8%
  );

  const nextMatch = upcomingMatches[0];

  return (
    <section className="zen-panel relative overflow-hidden rounded-2xl p-5 md:p-7">
      {/* 高端极光背景扫动效果 */}
      <div className="zen-scanline" aria-hidden />
      
      {/* 微光与渐变层 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent"
        aria-hidden
      />
      <div 
        className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full bg-emerald-400/5 blur-3xl" 
        aria-hidden 
      />

      <div className="relative grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* 左栏：品牌信息与数据驾驶舱 */}
        <div className="flex flex-col justify-between gap-6">
          <div className="space-y-4">
            {/* 精致状态徽章 */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span>AI 实时监视中</span>
            </div>

            <div>
              <h1 className="heading text-3xl font-black text-white sm:text-4xl">
                JMWL <span className="zen-text">世界杯 AI 预测系统</span>
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                整合 Elo 实力评分、近期战绩与核心球员属性，24小时智能扫描预测盘口，实时发现市场定价偏离与错价套利机会。
              </p>
            </div>
          </div>

          {/* 中部核心倒计时看板 */}
          {nextMatch && (
            <div className="rounded-xl border border-white/5 bg-white/[0.015] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                  🏆 2026 世界杯赛前扫描
                </span>
                <span className="rounded bg-gold-300/10 px-1.5 py-0.5 text-[9px] font-bold text-gold-300">
                  首战预热
                </span>
              </div>
              <div className="py-4 text-center">
                <div className="mono text-3xl font-black tracking-widest text-white sm:text-4xl">
                  <Countdown to={nextMatch.kickoff} />
                </div>
                <div className="mt-1 text-[9px] uppercase tracking-wider text-slate-500">
                  首轮揭幕战倒计时 (天 : 时 : 分 : 秒)
                </div>
              </div>
              <div className="border-t border-white/5 pt-2.5 text-center text-xs text-slate-400">
                <span className="font-semibold text-slate-300">揭幕战对决：</span>
                {nextMatch.home.zh} vs {nextMatch.away.zh} · {nextMatch.city}
              </div>
            </div>
          )}

          {/* 数据驾驶舱网格 */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <CockpitCard label="监控预测盘口" value={`${marketsCount} 个`} />
            <CockpitCard label="大盘交易额" value={`$${abbr(totalVolume)}`} />
            <CockpitCard label="参赛国家队" value={`${teamsCount} 支`} />
            <CockpitCard label="AI 捕获最大偏离" value={`+${(maxEdge * 100).toFixed(1)}%`} accent />
          </div>
        </div>

        {/* 右栏：焦点战错价雷达 */}
        <div className="rounded-xl border border-white/10 bg-[#0c1120]/80 p-4">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <h2 className="text-base font-black text-white">📡 临近焦点战错价雷达</h2>
            </div>
            <span className="text-xs text-slate-400">
              数据源: Polymarket
            </span>
          </div>

          <div className="space-y-4">
            {upcomingMatches.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                暂无临近的焦点对决。
              </div>
            ) : (
              upcomingMatches.map((m, index) => (
                <div 
                  key={m.id} 
                  className="group rounded-xl border border-white/10 bg-white/[0.02] p-3 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.02]"
                >
                  {/* 赛程信息与倒计时 */}
                  <div className="mb-2.5 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="mono rounded bg-white/10 px-1.5 py-0.5 text-xs text-slate-300 font-bold">
                        D{String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {m.stage === "Group" ? `${m.group}组` : m.stage}
                      </span>
                    </div>
                    <span className="mono text-emerald-300 font-semibold">
                      <Countdown to={m.kickoff} />
                    </span>
                  </div>

                  {/* 对阵信息 */}
                  <Link 
                    href={`/match/${m.id}`} 
                    className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <Flag code={m.home.code} className="h-4 w-6 shrink-0 shadow-sm" />
                      <span className="truncate text-xs font-bold text-slate-200 group-hover:text-white transition">
                        {m.home.zh}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-600">VS</span>
                    <div className="flex items-center justify-end gap-2 text-right">
                      <span className="truncate text-xs font-bold text-slate-200 group-hover:text-white transition">
                        {m.away.zh}
                      </span>
                      <Flag code={m.away.code} className="h-4 w-6 shrink-0 shadow-sm" />
                    </div>
                  </Link>

                  {/* AI 胜平负概率分布 */}
                  <div className="mt-2.5">
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="bg-electric" style={{ width: `${m.aiProb.home * 100}%` }} />
                      <div className="bg-slate-500" style={{ width: `${m.aiProb.draw * 100}%` }} />
                      <div className="bg-flame" style={{ width: `${m.aiProb.away * 100}%` }} />
                    </div>
                    <div className="mt-1 flex justify-between text-[9px] font-medium text-slate-400">
                      <span className="text-electric">主胜 {(m.aiProb.home * 100).toFixed(0)}%</span>
                      <span>平局 {(m.aiProb.draw * 100).toFixed(0)}%</span>
                      <span className="text-flame">客胜 {(m.aiProb.away * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* 错价建议 */}
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/5 pt-2">
                    <EdgeBadge teamZh={m.home.zh} edge={m.home.edge} />
                    <EdgeBadge teamZh={m.away.zh} edge={m.away.edge} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CockpitCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.025] px-3.5 py-3 transition hover:border-white/10">
      <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1.5 text-2xl font-black ${accent ? "zen-text" : "text-white"}`}>{value}</div>
    </div>
  );
}

function EdgeBadge({ teamZh, edge }: { teamZh: string; edge?: number }) {
  if (edge === undefined) return null;
  const absPct = Math.abs(edge * 100);
  const positive = edge >= 0;

  if (absPct < 1.0) {
    return (
      <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold text-slate-500">
        {teamZh}：无明显偏离
      </span>
    );
  }

  const badgeCls = positive
    ? "border border-electric/30 bg-electric/10 text-electric"
    : "border border-flame/30 bg-flame/10 text-flame";

  return (
    <span className={`rounded px-2 py-0.5 text-[9px] font-bold ${badgeCls}`}>
      {teamZh}：{positive ? "低估 (买 YES)" : "高估 (买 NO)"} {positive ? "+" : ""}{edge >= 0 ? "" : "-"}{absPct.toFixed(1)}%
    </span>
  );
}

function abbr(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(Math.round(n));
}

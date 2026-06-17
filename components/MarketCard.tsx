import type { Market } from "@/lib/polymarket";
import { HeatBadge } from "./ui";
import { TEAMS, flag } from "@/lib/worldcup";
import { modelChampionFor } from "@/lib/model";
import { formatSignedPct, recommendYesNo } from "@/lib/trade-recommendation";

function codeForName(name: string): string | undefined {
  return TEAMS.find((t) => t.name === name || t.zh === name)?.code;
}

export function MarketCard({ market, rank }: { market: Market; rank: number }) {
  const top = market.outcomes.slice(0, 4);
  const hot = market.heat >= 60;
  const leading = top[0];
  const leadingModel = leading ? modelForOutcome(leading.label) : 0;
  const leadingRec = leading && leadingModel > 0 ? recommendYesNo(leadingModel, leading.price) : undefined;
  const confidence = Math.min(0.98, 0.55 + market.heat / 180);
  return (
    <a
      href={market.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card group flex flex-col gap-3 overflow-hidden p-4 animate-fade-up"
    >
      {hot && (
        <span className="halo bg-emerald-400/10" aria-hidden />
      )}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="mono rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-sm font-bold text-emerald-300">
            #{String(rank).padStart(2, "0")}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="chip border border-cyan-400/25 bg-cyan-400/10 text-cyan-200">{market.platform}</span>
              <span className="chip border border-white/10 bg-white/[0.06] text-slate-300">{market.category}</span>
              {hot && <span className="chip border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">实时</span>}
            </div>
            <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-emerald-200">
              {market.title}
            </h3>
          </div>
        </div>
        <HeatBadge heat={market.heat} />
      </div>

      {leading && (
        <div className="rounded-lg border border-emerald-400/15 bg-[#0c1120]/80 p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500">
            <span>领跑选项</span>
            <span>模型置信度 {(confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-2">
            {codeForName(leading.label) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={flag(codeForName(leading.label)!)}
                alt=""
                className="h-4 w-6 rounded-[2px] object-cover"
              />
            )}
            <span className="flex-1 truncate text-sm font-semibold text-slate-100">{leading.label}</span>
            <span className="mono text-lg font-black text-emerald-300">{(leading.price * 100).toFixed(1)}%</span>
          </div>
          {leadingRec ? (
            <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  AI {(leadingModel * 100).toFixed(1)}% · 市场 {(leading.price * 100).toFixed(1)}%
                </span>
                <TradeBadge label={leadingRec.label} tone={leadingRec.tone} />
              </div>
              <div className="mt-1 text-[11px] text-slate-500">{leadingRec.reason}</div>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-[11px] text-slate-500">
              该盘口暂无可匹配 AI 胜率，先不输出 YES/NO。
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {top.map((o) => {
          const code = codeForName(o.label);
          const model = modelForOutcome(o.label);
          const rec = model > 0 ? recommendYesNo(model, o.price) : undefined;
          return (
            <div key={o.label} className="grid grid-cols-[auto_minmax(0,1fr)_3.5rem_4.5rem] items-center gap-2">
              {code && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={flag(code)} alt="" className="h-3.5 w-5 rounded-[2px] object-cover" />
              )}
              {!code && <span className="h-3.5 w-5" />}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-24 truncate text-xs text-slate-300">{o.label}</span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300"
                      style={{ width: `${Math.min(100, o.price * 100)}%` }}
                    />
                  </div>
                </div>
                {rec && (
                  <div className="mt-0.5 text-[10px] text-slate-500">
                    AI {(model * 100).toFixed(1)}% · 胜率差 {formatSignedPct(rec.edge)}
                  </div>
                )}
              </div>
              <span className="mono w-12 text-right text-xs font-semibold tabular-nums text-emerald-300">
                {(o.price * 100).toFixed(1)}%
              </span>
              {rec ? <TradeBadge label={rec.action} tone={rec.tone} compact /> : <span className="text-right text-[10px] text-slate-600">--</span>}
            </div>
          );
        })}
      </div>

      <div className="mt-1 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-xs">
        <Metric label="成交" value={`$${abbr(market.volume)}`} />
        <Metric label="热度" value={market.heat.toFixed(1)} accent={hot} />
        <Metric label="状态" value={hot ? "扫描" : "观察"} accent={hot} />
      </div>
    </a>
  );
}

function modelForOutcome(label: string): number {
  const code = codeForName(label);
  return code ? modelChampionFor(code) : 0;
}

function TradeBadge({
  label,
  tone,
  compact,
}: {
  label: string;
  tone: "yes" | "no" | "watch";
  compact?: boolean;
}) {
  const cls =
    tone === "yes"
      ? "border-emerald-400/35 bg-emerald-400/12 text-emerald-300"
      : tone === "no"
        ? "border-orange-400/35 bg-orange-400/12 text-orange-300"
        : "border-slate-500/30 bg-slate-500/10 text-slate-300";
  return (
    <span className={`rounded-full border font-black ${compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"} ${cls}`}>
      {label}
    </span>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mono mt-0.5 text-sm font-bold ${accent ? "text-emerald-300" : "text-slate-200"}`}>{value}</div>
    </div>
  );
}

function abbr(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(Math.round(n));
}

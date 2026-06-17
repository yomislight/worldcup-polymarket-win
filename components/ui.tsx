import Link from "next/link";

export function Flag({ code, className = "" }: { code: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={code}
      className={`inline-block rounded-[3px] object-cover ${className}`}
    />
  );
}

export function ProbBar({
  home,
  draw,
  away,
  labels,
}: {
  home: number;
  draw: number;
  away: number;
  labels?: [string, string, string];
}) {
  const fmt = (v: number) => `${Math.round(v * 100)}%`;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full">
        <div style={{ width: fmt(home) }} className="bg-electric" />
        <div style={{ width: fmt(draw) }} className="bg-slate-500" />
        <div style={{ width: fmt(away) }} className="bg-flame" />
      </div>
      <div className="mt-1.5 flex justify-between text-xs">
        <span className="text-electric">{labels?.[0] ?? "主胜"} {fmt(home)}</span>
        <span className="text-slate-400">{labels?.[1] ?? "平"} {fmt(draw)}</span>
        <span className="text-flame">{labels?.[2] ?? "客胜"} {fmt(away)}</span>
      </div>
    </div>
  );
}

export function HeatBadge({ heat }: { heat: number }) {
  const hot = heat >= 60;
  return (
    <span
      className={`chip border ${hot ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-white/10 text-slate-300"}`}
      title="热度 = 24h成交增速·总量·流动性·临场加权"
    >
      {hot ? "热门" : "扫描"} {heat.toFixed(1)}
    </span>
  );
}

export function SectionTitle({
  children,
  sub,
  action,
}: {
  children: React.ReactNode;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="relative pl-4">
        <span className="absolute left-0 top-1 h-[calc(100%-0.4rem)] w-1.5 rounded-full bg-gradient-to-b from-emerald-300 via-cyan-300 to-violet-300 shadow-glow-electric" />
        <h2 className="text-2xl font-black tracking-normal text-white sm:text-3xl">{children}</h2>
        {sub && <p className="mt-1 max-w-2xl text-sm text-slate-400">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2.5 text-center">
      <div className={`impact text-2xl ${accent ? "gold-text" : "text-white"}`}>{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}

export function TradeBadge({ label, tone }: { label: string; tone: "yes" | "no" | "watch" }) {
  const cls =
    tone === "yes"
      ? "border-emerald-400/35 bg-emerald-400/12 text-emerald-300"
      : tone === "no"
        ? "border-orange-400/35 bg-orange-400/12 text-orange-300"
        : "border-slate-500/30 bg-slate-500/10 text-slate-300";
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-[11px] font-black sm:px-2.5 sm:text-xs ${cls}`}>
      {label}
    </span>
  );
}

export function LinkBtn({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls =
    "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold-300 to-gold-500 px-3.5 py-2 text-sm font-semibold text-pitch-900 shadow-glow transition hover:brightness-110";
  if (external)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

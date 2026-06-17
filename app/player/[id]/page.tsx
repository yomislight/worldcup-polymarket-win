import { PLAYERS, playerById, playerPhoto } from "@/lib/players";
import { teamByCode, flag } from "@/lib/worldcup";
import { Radar } from "@/components/Radar";
import { SectionTitle, Flag, Stat } from "@/components/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-static";
export function generateStaticParams() {
  // Pre-render first 200 players; the rest are served on-demand + cached.
  return PLAYERS.slice(0, 200).map((p) => ({ id: p.id }));
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = playerById(id);
  if (!p) return notFound();
  const t = teamByCode(p.team)!;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 p-8 pitch-stripes">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 via-transparent to-pitch-900" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={playerPhoto(p)} alt={p.name} className="h-32 w-32 rounded-3xl bg-pitch-700 object-cover ring-4 ring-gold-400/30 shadow-glow" />
            <span className="absolute -bottom-2 -right-2 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-500 heading text-xl text-pitch-900 shadow-glow">
              {p.rating.toFixed(1)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Flag code={t.code} className="h-5 w-7" />
              <Link href={`/team/${t.code}`} className="text-sm text-slate-300 hover:text-gold-300">{t.zh}</Link>
            </div>
            <h1 className="heading text-6xl text-white">{p.zh}</h1>
            <p className="text-slate-400">{p.name} · {p.position} · #{p.number} · {p.age}岁</p>
            <p className="text-sm text-slate-400">效力俱乐部：{p.club}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.styleTags.map((tag) => (
                <span key={tag} className="chip bg-gold-400/15 text-gold-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <SectionTitle sub="六维能力评估">📈 打法雷达</SectionTitle>
          <div className="card grid place-items-center p-6">
            <Radar values={p.attrs} size={260} />
          </div>
        </section>

        <section>
          <SectionTitle sub="本届世界杯数据统计">🔢 赛事数据</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="出场" value={String(p.stats.apps)} />
            <Stat label="进球" value={String(p.stats.goals)} accent />
            <Stat label="助攻" value={String(p.stats.assists)} />
            <Stat label="预期进球 xG" value={p.stats.xg.toFixed(1)} />
          </div>
          <div className="card mt-3 p-4">
            <div className="mb-2 text-sm font-semibold text-white">能力明细</div>
            {["速度", "射门", "传球", "盘带", "防守", "身体"].map((label, i) => (
              <div key={label} className="mb-2 flex items-center gap-3">
                <span className="w-10 text-xs text-slate-400">{label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-electric to-gold-300" style={{ width: `${p.attrs[i]}%` }} />
                </div>
                <span className="w-8 text-right text-xs font-semibold text-gold-300">{p.attrs[i]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="text-center">
        <Link href="/players" className="text-sm text-slate-400 hover:text-gold-300">← 返回球星中心</Link>
      </div>
    </div>
  );
}

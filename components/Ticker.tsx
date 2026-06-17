import { Flag } from "@/components/ui";

type Item = { label: string; value: string; code?: string };

export function Ticker({ items }: { items: Item[] }) {
  if (!items.length) return null;
  const loop = [...items, ...items];
  return (
    <div className="relative border-y border-emerald-400/15 bg-[#0c1120]/82 backdrop-blur">
      <div className="absolute left-0 top-0 z-10 flex h-full items-center gap-1.5 bg-emerald-400 px-3 text-[11px] font-bold uppercase tracking-wider text-[#04130c] shadow-glow-electric">
        即时赔率
      </div>
      <div className="marquee-mask overflow-hidden py-2 pl-24">
        <div className="flex w-max animate-marquee gap-8 will-change-transform hover:[animation-play-state:paused]">
          {loop.map((it, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm">
              {it.code && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://flagcdn.com/w40/${it.code}.png`}
                  alt=""
                  className="h-3.5 w-5 rounded-[2px] object-cover"
                />
              )}
              <span className="font-semibold text-slate-200">{it.label}</span>
              <span className="rounded px-1 font-bold tabular-nums text-emerald-300">
                {it.value}
              </span>
              <span className="text-white/15">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "市场扫描" },
  { href: "/timeline", label: "赛程时间线" },
  { href: "/teams", label: "球队" },
  { href: "/players", label: "球员" },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-400/15 bg-[#070a14]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <svg
            viewBox="0 0 40 40"
            className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
            aria-hidden="true"
          >
            <rect width="40" height="40" rx="9" fill="#0c1f17" />
            <path
              d="M20 6 L31 12.5 L31 27.5 L20 34 L9 27.5 L9 12.5 Z"
              fill="none"
              stroke="#27f58a"
              strokeWidth="2"
            />
            <rect x="14" y="22" width="3.4" height="6" rx="1" fill="#27f58a" />
            <rect x="18.3" y="18" width="3.4" height="10" rx="1" fill="#27f58a" />
            <rect x="22.6" y="13" width="3.4" height="15" rx="1" fill="#ffd84d" />
          </svg>
          <span className="whitespace-nowrap text-lg font-black tracking-normal text-white sm:text-xl">
            <span className="zen-text">JMWL</span>
            <span className="hidden sm:inline"> 世界杯预测</span>
          </span>
          <span className="hidden rounded border border-electric/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-electric md:inline">
            2026 世界杯
          </span>
        </Link>
        <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto sm:gap-1 [&::-webkit-scrollbar]:hidden">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-colors sm:px-3 sm:text-sm ${
                  active
                    ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-glow-electric"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

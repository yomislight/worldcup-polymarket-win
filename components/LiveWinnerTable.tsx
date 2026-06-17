"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag, TradeBadge } from "@/components/ui";
import { formatSignedPct, recommendYesNo } from "@/lib/trade-recommendation";

export type WinnerRow = {
  label: string;
  code?: string;
  price: number;
  model: number;
  url?: string;
};

export function LiveWinnerTable({
  rows: initial,
  fallbackUrl,
}: {
  rows: WinnerRow[];
  fallbackUrl: string;
}) {
  const [rows, setRows] = useState(initial);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  // 页面挂载后请求一次 /api/odds（读 KV），用最新价格覆盖构建时数据。
  // 不轮询，无定时器，Worker 每请求 CPU < 1ms。
  useEffect(() => {
    fetch("/api/odds", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { outcomes: { label: string; price: number }[]; updatedAt: number } | null) => {
        if (!data?.outcomes?.length) return;
        const priceMap = new Map(data.outcomes.map((o) => [o.label, o.price]));
        setRows((cur) =>
          cur.map((row) => {
            const p = priceMap.get(row.label);
            return p != null ? { ...row, price: p } : row;
          })
        );
        setUpdatedAt(data.updatedAt);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[1.1fr_0.62fr_0.62fr_0.78fr_0.78fr] gap-1.5 border-b border-white/10 px-3 py-2.5 text-[11px] uppercase tracking-wide text-slate-400 sm:gap-2 sm:px-4 sm:text-xs">
        <span>球队</span>
        <span className="text-right">隐含概率</span>
        <span className="text-right">模型胜率</span>
        <span className="text-right">建议</span>
        <span className="text-right">胜率差值</span>
      </div>
      {rows.map((row) => {
        const rec = row.model > 0 ? recommendYesNo(row.model, row.price) : undefined;
        return (
          <Link
            key={row.label}
            href={row.url ?? fallbackUrl}
            target="_blank"
            rel="noreferrer"
            className="grid grid-cols-[1.1fr_0.62fr_0.62fr_0.78fr_0.78fr] items-center gap-1.5 border-b border-white/5 px-3 py-2.5 text-xs transition hover:bg-white/5 last:border-0 sm:gap-2 sm:px-4 sm:text-sm"
          >
            <span className="flex min-w-0 items-center gap-1.5 font-medium text-white sm:gap-2">
              {row.code && <Flag code={row.code} className="h-3.5 w-5 shrink-0 sm:h-4 sm:w-6" />}
              <span className="truncate">{row.label}</span>
            </span>
            <span className="text-right font-bold tabular-nums text-emerald-300">
              {(row.price * 100).toFixed(2)}%
            </span>
            <span className="text-right tabular-nums text-slate-300">
              {row.model > 0 ? `${(row.model * 100).toFixed(1)}%` : "--"}
            </span>
            <span className="text-right">{rec ? <TradeBadge label={rec.label} tone={rec.tone} /> : "--"}</span>
            <span
              className={`text-right tabular-nums ${
                rec?.tone === "yes" ? "text-emerald-300" : rec?.tone === "no" ? "text-orange-300" : "text-slate-400"
              }`}
            >
              {rec ? formatSignedPct(rec.edge) : "--"}
            </span>
          </Link>
        );
      })}
      <div className="flex items-center justify-end gap-1.5 border-t border-white/10 px-4 py-1.5 text-[10px] uppercase tracking-wider text-slate-500">
        {updatedAt
          ? `Polymarket · ${new Date(updatedAt).toLocaleTimeString("zh-CN", { hour12: false })}`
          : "Polymarket · 构建时数据"}
      </div>
    </div>
  );
}

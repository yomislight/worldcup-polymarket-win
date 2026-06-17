import { SectionTitle } from "@/components/ui";

const VIDEO_ID = "UMkeKn-NKYE";
const VIDEO_TITLE = "JMWL 视频解读 · 世界杯预测市场怎么玩";
const TG_LINK = "https://t.me/+fcXADOedJYE2OTNl";

export function VideoSection() {
  return (
    <section id="video">
      <SectionTitle sub="3 分钟看完 · 视频版每日扫盘信号、YES/NO 判断逻辑和盘口变化追踪">
        <span className="zen-text">视频解读</span> · 预测市场入门到上手
      </SectionTitle>

      <div className="card relative overflow-hidden p-0">
        {/* 背景辉光 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 18% 10%, rgba(39,245,138,0.12), transparent 42%), radial-gradient(circle at 88% 90%, rgba(34,211,238,0.10), transparent 38%)",
          }}
        />

        <div className="relative grid gap-0 lg:grid-cols-[1.6fr_1fr]">
          {/* 视频区：16:9 响应式 iframe */}
          <div className="relative">
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`}
                title={VIDEO_TITLE}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>

          {/* 右侧文案 + CTA */}
          <div className="relative flex flex-col justify-between gap-5 p-6 lg:p-7">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(39,245,138,0.9)]" />
                New · 视频解读
              </div>
              <h3 className="mt-3 text-xl font-black text-white sm:text-2xl">
                从「这是什么」到「我该怎么下注」
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                用一档节目说清 Polymarket 世界杯盘口的玩法、价值雷达怎么用、怎么跟 AI 扫盘信号对照下注。视频内提到的所有信号会同步发到 Telegram 社群。
              </p>

              <ul className="mt-4 space-y-2 text-[13px] text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                  Polymarket 盘口机制 + 隐含概率换算
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                  AI 价值雷达的工作原理 · 错价怎么定义
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-300" />
                  实战案例：3 个 YES / 3 个 NO 信号拆解
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <a
                href={TG_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-300/35 bg-emerald-300 px-4 py-2.5 text-sm font-black text-ink-950 shadow-[0_0_24px_rgba(39,245,138,0.32)] transition hover:brightness-110"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.13-3.05-1.99 1.93c-.23.23-.42.42-.86.42z" />
                </svg>
                进 Telegram 社群看每日信号
              </a>
              <a
                href={`https://youtu.be/${VIDEO_ID}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/10"
              >
                在 YouTube 打开
              </a>
            </div>

            <div className="text-[11px] text-slate-500">
              视频不会嵌入任何追踪脚本 · 使用 youtube-nocookie 域 · 首次播放才加载
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

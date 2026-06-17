# JMWL World Cup · AI 世界杯预测市场分析站

|> 🌐 **线上地址：** https://pitchodds.sonic980828.workers.dev  
|> 💬 **Telegram 社群：** https://t.me/+fcXADOedJYE2OTNl
> 🐦 **视频解读：** https://youtu.be/UMkeKn-NKYE

---

## 项目简介

2026 FIFA 世界杯于 **6 月 11 日**（美/加/墨三国联合）开幕。本站聚合 **Polymarket 实时盘口**，结合 **MiniMax AI 独立定价**与自研 **Elo + 教练 + 状态** 多因子模型，帮助用户：

- 🔥 扫描市场热度，找到 **成交量异动** 的盘口
- 🤖 对照 **AI 独立概率 vs 市场隐含概率**，发现定价偏差（value bet 信号）
- ⚡ 查看 **跨平台价差雷达**（Polymarket 实时价 vs 示例对照）
- ⚽ 浏览 **104 场赛程**，每场附带 AI 胜率分析卡、比分预测、H2H 历史
- 🌍 查看 **48 支球队** 详情：主教练履历、近一年战绩、Elo 调整因子
- ⭐ 查看 **1255 名球员**：六维打法雷达、评分、赛事数据

---

## 核心功能

| 模块 | 功能描述 |
|------|----------|
| **首页 · 市场扫描** | Polymarket 实时盘口热度榜、AI 定价 vs 市场对照、跨平台价差雷达、模型夺冠概率 Top 8 |
| **赛程时间线** | 104 场按日分组，倒计时、场馆、模型胜率条，支持扫描索引快速跳转 |
| **比赛详情** | AI 战术分析卡（MiniMax，对市场盲测）+ 量化模型胜率 + 泊松比分预测 + H2H 交锋 |
| **球队中心** | 48 支球队分组总览，详情含主教练战绩、近一年比赛、Elo 调整因子 |
| **球员中心** | Watchlist 排行 + 六维雷达图 + 打法标签 + 赛事数据（进球/助攻/xG） |
| **LIVE 跑马灯** | 顶栏实时滚动 Polymarket 夺冠概率（含国旗，鼠标悬停暂停） |
| **TG 社群入口** | 每日 AI 扫盘信号同步，页脚直接加入 |

---

## 技术栈

| 层 | 技术 |
|----|------|
| **框架** | Next.js 15 (App Router) + React 19 + TypeScript |
| **样式** | Tailwind CSS 3 · 自定义「潮牌 Hype」设计系统（Anton 冲击字、霓虹辉光、脉冲动效） |
| **AI** | MiniMax（中国节点）`MiniMax-Text-01` · 对市场盲测独立定价 · 30 分钟内存缓存 |
| **数据** | Polymarket Gamma API（公开免 key，实时）· 自生成 48 队 / 104 场 / 1255 球员数据集 |
| **模型** | Elo + 教练胜率 + 近期状态 + 阵容评分多因子调整 · Poisson 比分矩阵 |
| **部署** | Cloudflare Workers（OpenNext 适配）· 全球 300+ 边缘节点 · 359 页静态预渲染 |

---

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 本地开发（需 .env.local 配置 MiniMax key）
pnpm dev          # http://localhost:3000

# 3. 刷新世界杯数据（赛程/球队/球员）
pnpm data:pull

# 4. 生产预览
pnpm build && pnpm start
```

### 环境变量（`.env.local`，不进版本库）

```env
MINIMAX_API_KEY=your_key_here
MINIMAX_BASE_URL=https://api.minimax.chat
MINIMAX_MODEL=MiniMax-Text-01
```

---

## 项目结构

```
├── app/
│   ├── page.tsx                 # 首页：Hero / AI对照 / 热度榜 / 价差雷达 / 夺冠模型
│   ├── timeline/page.tsx        # 赛程时间线（按日 + 扫描索引）
│   ├── match/[id]/page.tsx      # 比赛详情：AI分析卡 / 比分预测 / H2H / 球员
│   ├── team/[code]/page.tsx     # 球队详情：教练 / 战绩 / 赛程 / 阵容
│   ├── teams/page.tsx           # 分组总览（48队12组）
│   ├── player/[id]/page.tsx     # 球员详情：雷达图 / 数据 / 打法标签
│   └── players/page.tsx         # 球员 Watchlist 排行榜
│
├── lib/
│   ├── ai.ts                    # MiniMax 客户端 · 盲测定价 · TTL 缓存 · 兜底回退
│   ├── model.ts                 # Elo 多因子模型 · 胜率 / 比分 / 夺冠概率
│   ├── polymarket.ts            # Polymarket Gamma API · 热度算法 · 价差雷达
│   ├── worldcup.ts              # 球队 / 赛程 / H2H 数据入口
│   ├── players.ts               # 球员数据入口
│   ├── team-insights.ts         # 主教练档案 · 近期战绩 · 状态因子
│   ├── trade-recommendation.ts  # 盘口推荐聚合
│   └── generated/
│       ├── worldcup-data.ts     # 自动生成：48队 / 104场
│       └── player-data.ts       # 自动生成：1255名球员
│
├── components/
│   ├── Nav.tsx                  # 导航栏（IMPACT 字体 · 电光青高亮）
│   ├── Ticker.tsx               # LIVE 赔率跑马灯（Polymarket 实时）
│   ├── MarketCard.tsx           # 盘口热度卡（扫光 · 火焰脉冲）
│   ├── Radar.tsx                # 纯 SVG 六维雷达图
│   ├── Countdown.tsx            # 实时倒计时
│   ├── Motion.tsx               # CountUp 数字滚动 · Reveal 滚动揭示
│   ├── ScannerConsole.tsx       # 扫描台 UI 组件
│   └── ui.tsx                   # 原子组件（Flag / ProbBar / SectionTitle / Stat）
│
├── scripts/
│   ├── pull-worldcup-data.mjs   # 拉取公开数据生成 lib/generated/
│   └── clean-next-cache.mjs     # 清理 .next 缓存
│
├── wrangler.jsonc               # Cloudflare Workers 配置
├── open-next.config.ts          # OpenNext Cloudflare 适配器配置
└── tailwind.config.ts           # 潮牌 Hype 设计系统 token
```

---

## 数据说明

| 数据 | 来源 | 状态 |
|------|------|------|
| Polymarket 盘口 / 赔率 / 成交量 | Gamma API（公开，无需 key） | ✅ **实时真实** |
| 球队 / 赛程 | `scripts/pull-worldcup-data.mjs` 生成 | ✅ 48 队 / 104 场 |
| 球员名单 | 公开球员数据生成 | ✅ 1255 人 |
| 球员照片 | DiceBear 头像（占位，无授权问题） | ✅ 可替换真实图 |
| 币安 / OKX 盘口 | 价差板块示例数据 | ⏳ API 成熟后接入 |
| Kalshi 盘口 | — | ⏳ V2 计划 |

> **热度算法：** `0.45 × 24h成交增速 + 0.30 × log(总量) + 0.15 × 流动性 + 0.10 × 临场权重`

---

## 部署到 Cloudflare

```bash
# 一次性完整部署
rm -rf .next .open-next
pnpm build
npx opennextjs-cloudflare build
npx wrangler deploy

# 上传 MiniMax key（首次）
echo "your_key" | npx wrangler secret put MINIMAX_API_KEY
```

**已部署：** https://pitchodds.sonic980828.workers.dev  
**版本：** Next.js 15 + OpenNext 1.19 + Cloudflare Workers · 359 页静态预渲染

---

## 路线图

- **V1（已上线）** Polymarket 实时盘口 · AI 价值雷达 · 赛程 / 球队 / 球员 · 热血潮牌 UI
- **V2** 接入 Kalshi 真实多平台价差 · 赔率历史走势图 · 单场盘口聚合
- **V3** Watchlist + 价格提醒 · 免费预测战绩排行榜 · 多语言支持

---

> ⚠️ **免责声明：** 本站仅供信息参考，非投资建议。预测市场存在风险，请遵守所在地区法律法规。AI 分析由 MiniMax 生成，存在不确定性，请独立判断。

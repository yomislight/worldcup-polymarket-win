// Pure-SVG hexagon radar chart for player attributes.
//
// Visual changes vs. original:
//   - Labels bumped to 13px (was 11px) with full white text and a small
//     black drop-shadow halo so they stay readable on the gold data fill
//   - Each label is nudged radially along its own angle so the text never
//     overlaps the polygon edge (right side / bottom labels were clipping)
//   - Grid rings and spokes switched to higher-contrast rgba(255,255,255,0.14)
//     so the empty area is still visible against the card background
//   - Added per-attribute color tints on the data dots + tiny value chips
//     so the radar matches the page's "per-attribute color" system
const LABELS = ["速度", "射门", "传球", "盘带", "防守", "身体"];
const COLORS = ["#27f58a", "#f5c518", "#22d3ee", "#a855f7", "#cbd5e1", "#fb923c"];

export function Radar({ values, size = 260 }: { values: number[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 36; // leaves more room for labels
  const n = 6;
  const pt = (i: number, frac: number) => {
    const ang = (Math.PI / 2) * -1 + (i * 2 * Math.PI) / n;
    return [cx + r * frac * Math.cos(ang), cy + r * frac * Math.sin(ang)];
  };
  const rings = [0.25, 0.5, 0.75, 1];
  const poly = (frac: number) =>
    Array.from({ length: n }, (_, i) => pt(i, frac).join(",")).join(" ");
  const dataPoly = values
    .map((v, i) => pt(i, Math.max(0.05, v / 100)).join(","))
    .join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5c518" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#f5c518" stopOpacity="0.12" />
        </radialGradient>
        <filter id="radar-label-halo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
          <feOffset dy="0.5" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.85" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* rings */}
      {rings.map((f) => (
        <polygon
          key={f}
          points={poly(f)}
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth={1}
        />
      ))}
      {/* spokes */}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = pt(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.12)"
          />
        );
      })}

      {/* data fill */}
      <polygon
        points={dataPoly}
        fill="url(#radar-fill)"
        stroke="#f5c518"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* data points + per-axis value chip */}
      {values.map((v, i) => {
        const [x, y] = pt(i, Math.max(0.05, v / 100));
        const color = COLORS[i] ?? "#f5c518";
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={4.5} fill={color} stroke="#07121b" strokeWidth={1.5} />
          </g>
        );
      })}

      {/* labels — each pushed radially along its own angle so nothing clips */}
      {LABELS.map((lab, i) => {
        const [x, y] = pt(i, 1.22);
        // Small per-label offset so 6 o'clock + 12 o'clock lines don't fight
        const ang = (Math.PI / 2) * -1 + (i * 2 * Math.PI) / n;
        const dx = Math.cos(ang) * 4;
        const dy = Math.sin(ang) * 4 + 4;
        return (
          <g key={lab} filter="url(#radar-label-halo)">
            <text
              x={x + dx}
              y={y + dy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={13}
              fontWeight={700}
              fill="#f8fafc"
            >
              {lab}
            </text>
            <text
              x={x + dx}
              y={y + dy + 16}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={800}
              fill={COLORS[i] ?? "#f5c518"}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {values[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

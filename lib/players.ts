// Player pool generated from public World Cup 2026 squad pages. Avatars are
// a hand-crafted SVG monogram system (outer ring = team primary, inner = team
// secondary, big initial + number badge). Zero external requests, zero
// licensing risk, identical treatment for all 1,255 players.
import { GENERATED_PLAYERS } from "./generated/player-data";
import { teamColorsFor } from "./team-colors";

export type Player = {
  id: string;
  name: string;
  zh: string;
  team: string; // team code
  number: number;
  position: "GK" | "DF" | "MF" | "FW";
  age: number;
  club: string;
  rating: number; // 0-10 tournament form rating
  photo?: string;
  styleTags: string[];
  // radar attributes 0-100: pace, shooting, passing, dribbling, defending, physical
  attrs: [number, number, number, number, number, number];
  stats: { apps: number; goals: number; assists: number; xg: number };
};

export const PLAYERS: Player[] = GENERATED_PLAYERS;

export function playerById(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}
export function playersByTeam(code: string): Player[] {
  return PLAYERS.filter((p) => p.team === code);
}
export function playerPhoto(p: Player): string {
  return p.photo ?? monogramAvatar(p);
}

// --- Monogram avatar system --------------------------------------------------
//
// Layout:
//   - Outer ring: 4px stroke in the team primary color
//   - Inner disc: team secondary color, subtle radial highlight top-left
//   - Center:    large bold initial, picked from zh (CJK) or first letter of name
//   - Corner:    squad number in a small electric-green pill
//
// Every player gets the same template — no special-casing — so the
// watchlist reads as a fair horizontal scan, not a popularity contest.
function monogramAvatar(player: Player): string {
  const c = teamColorsFor(player.team);
  const initial = pickInitial(player);
  const number = String(player.number).padStart(2, "0");
  const size = 160;

  // Seed the gradient angle from the player id so the highlight isn't
  // identical across the page, but stays stable per player.
  const seed = hashCode(player.id);
  const angle = (seed % 360).toFixed(0);
  const highlightId = `hl-${seed}`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <radialGradient id="${highlightId}" cx="35%" cy="30%" r="75%">
      <stop offset="0" stop-color="${c.primary}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${c.secondary}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- dark backdrop so transparent PNG exports look right -->
  <rect width="${size}" height="${size}" rx="32" fill="${c.secondary}"/>
  <!-- inner disc + outer ring -->
  <circle cx="${size / 2}" cy="${size / 2}" r="62" fill="${c.secondary}"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="62" fill="url(#${highlightId})" transform="rotate(${angle} ${size / 2} ${size / 2})"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="62" fill="none" stroke="${c.primary}" stroke-width="4" stroke-opacity="0.95"/>
  <!-- subtle inner stroke for the "chip" feel -->
  <circle cx="${size / 2}" cy="${size / 2}" r="56" fill="none" stroke="${c.primary}" stroke-width="1" stroke-opacity="0.35"/>
  <!-- monogram initial -->
  <text x="${size / 2}" y="${size / 2 + 4}" text-anchor="middle"
        dominant-baseline="middle"
        font-family="Outfit, 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
        font-size="56" font-weight="900" fill="${c.text}" letter-spacing="-1">${escapeXml(initial)}</text>
  <!-- squad number badge (electric-green) -->
  <g>
    <rect x="106" y="110" width="42" height="32" rx="10" fill="#07121b" stroke="#27f58a" stroke-width="1.5"/>
    <text x="127" y="131" text-anchor="middle"
          font-family="Outfit, system-ui, sans-serif"
          font-size="16" font-weight="800" fill="#27f58a">#${escapeXml(number)}</text>
  </g>
  <!-- team code micro-label, bottom-left -->
  <text x="14" y="150" font-family="JetBrains Mono, ui-monospace, monospace"
        font-size="10" font-weight="700" fill="${c.primary}" letter-spacing="1.5" opacity="0.85">${escapeXml(player.team.toUpperCase())}</text>
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function pickInitial(p: Player): string {
  // Prefer the Chinese name (1–2 chars) — looks more distinctive than Latin
  // initials on a small avatar, and stays consistent with the rest of the UI
  // which always shows `zh` as the headline.
  if (p.zh && p.zh.length <= 2) return p.zh;
  if (p.zh) return p.zh.slice(-1); // multi-char Chinese → take the surname / first
  // Fallback: first letter of the English name
  const first = p.name.trim().charAt(0).toUpperCase();
  return first || "?";
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

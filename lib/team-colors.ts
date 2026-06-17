// Team primary/secondary kit colors. Hand-curated from each country's flag
// dominant tones — keeps the avatar system in sync with the Hype palette and
// avoids the licensing rabbit hole of pulling real kit photography.
export type TeamColors = {
  primary: string; // outer ring + bold accent
  secondary: string; // inner fill (always darker for contrast)
  text: string; // initials color (white or near-black)
};

export const TEAM_COLORS: Record<string, TeamColors> = {
  // Group A
  mx: { primary: "#006847", secondary: "#0a2a1c", text: "#ffffff" }, // Mexico
  za: { primary: "#007749", secondary: "#0a2a1c", text: "#ffb612" }, // South Africa
  kr: { primary: "#cd2e3a", secondary: "#0a1228", text: "#ffffff" }, // South Korea
  cz: { primary: "#11457e", secondary: "#0a1228", text: "#ffffff" }, // Czech
  // Group B
  ca: { primary: "#d52b1e", secondary: "#1a0a0a", text: "#ffffff" }, // Canada
  ba: { primary: "#002395", secondary: "#0a1228", text: "#ffd200" }, // Bosnia
  qa: { primary: "#8d1b3d", secondary: "#1a0a14", text: "#ffffff" }, // Qatar
  ch: { primary: "#d52b1e", secondary: "#1a0a0a", text: "#ffffff" }, // Switzerland
  // Group C
  br: { primary: "#009c3b", secondary: "#002776", text: "#ffdf00" }, // Brazil
  ma: { primary: "#c1272d", secondary: "#0a1228", text: "#006233" }, // Morocco
  ht: { primary: "#00209f", secondary: "#0a1228", text: "#d21034" }, // Haiti
  "gb-sct": { primary: "#1a4d8f", secondary: "#0a1228", text: "#ffffff" }, // Scotland
  // Group D
  us: { primary: "#b22234", secondary: "#0c1a2c", text: "#ffffff" }, // USA
  py: { primary: "#d52b1e", secondary: "#0a1228", text: "#ffffff" }, // Paraguay
  au: { primary: "#00843d", secondary: "#0c1a2c", text: "#ffcd00" }, // Australia
  tr: { primary: "#e30a17", secondary: "#0a0a14", text: "#ffffff" }, // Türkiye
  // Group E
  de: { primary: "#1a1a1a", secondary: "#0a0a0a", text: "#ffce00" }, // Germany
  cw: { primary: "#002b7f", secondary: "#0a1228", text: "#f9e51e" }, // Curaçao
  ci: { primary: "#f77f00", secondary: "#1a1a1a", text: "#ffffff" }, // Côte d'Ivoire
  ec: { primary: "#fcd116", secondary: "#0a1228", text: "#003893" }, // Ecuador
  // Group F
  nl: { primary: "#ff6f00", secondary: "#0a0a14", text: "#21468b" }, // Netherlands
  jp: { primary: "#bc002d", secondary: "#0a0a14", text: "#ffffff" }, // Japan
  se: { primary: "#006aa7", secondary: "#0a1228", text: "#fecc00" }, // Sweden
  tn: { primary: "#e70013", secondary: "#0a0a14", text: "#ffffff" }, // Tunisia
  // Group G
  be: { primary: "#fae042", secondary: "#0a0a14", text: "#ed2939" }, // Belgium
  eg: { primary: "#ce1126", secondary: "#0a0a14", text: "#ffffff" }, // Egypt
  ir: { primary: "#239f40", secondary: "#0a0a14", text: "#ffffff" }, // Iran
  nz: { primary: "#0c1c2c", secondary: "#000000", text: "#ffffff" }, // New Zealand
  // Group H
  es: { primary: "#aa151b", secondary: "#0a0a14", text: "#f1bf00" }, // Spain
  cv: { primary: "#003893", secondary: "#0a0a14", text: "#ffffff" }, // Cabo Verde
  sa: { primary: "#006c35", secondary: "#0a0a14", text: "#ffffff" }, // Saudi Arabia
  uy: { primary: "#0038a8", secondary: "#0a0a14", text: "#ffffff" }, // Uruguay
  // Group I
  fr: { primary: "#0055a4", secondary: "#0a0a14", text: "#ffffff" }, // France
  sn: { primary: "#00853f", secondary: "#0a0a14", text: "#fdef42" }, // Senegal
  iq: { primary: "#ce1126", secondary: "#0a0a14", text: "#ffffff" }, // Iraq
  no: { primary: "#ef2b2d", secondary: "#0a0a14", text: "#ffffff" }, // Norway
  // Group J
  ar: { primary: "#74acdf", secondary: "#0a0a14", text: "#f6b40e" }, // Argentina
  dz: { primary: "#006233", secondary: "#0a0a14", text: "#ffffff" }, // Algeria
  at: { primary: "#ed2939", secondary: "#0a0a14", text: "#ffffff" }, // Austria
  jo: { primary: "#ce1126", secondary: "#0a0a14", text: "#007a3d" }, // Jordan
  // Group K
  pt: { primary: "#006600", secondary: "#0a0a14", text: "#ff0000" }, // Portugal
  cd: { primary: "#007fff", secondary: "#0a0a14", text: "#f7d518" }, // DR Congo
  uz: { primary: "#1eb53a", secondary: "#0a0a14", text: "#ffffff" }, // Uzbekistan
  co: { primary: "#fcd116", secondary: "#0a0a14", text: "#003893" }, // Colombia
  // Group L
  "gb-eng": { primary: "#cf142b", secondary: "#0a0a14", text: "#ffffff" }, // England
  hr: { primary: "#ff0000", secondary: "#0a0a14", text: "#ffffff" }, // Croatia
  gh: { primary: "#006b3f", secondary: "#0a0a14", text: "#fcd116" }, // Ghana
  pa: { primary: "#005aa7", secondary: "#0a0a14", text: "#ffffff" }, // Panama
};

// Safe fallback: anyone missing a color gets a neutral electric-green.
export const DEFAULT_TEAM_COLORS: TeamColors = {
  primary: "#27f58a",
  secondary: "#0b1322",
  text: "#ffffff",
};

export function teamColorsFor(code: string): TeamColors {
  return TEAM_COLORS[code] ?? DEFAULT_TEAM_COLORS;
}

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070A14",
          900: "#0C1120",
          800: "#131A30",
          700: "#1B243F",
        },
        pitch: {
          900: "#08140E",
          700: "#0B281B",
          500: "#105B3A",
          400: "#177A4C",
        },
        gold: {
          300: "#FDE68A",
          400: "#FBBF24",
          500: "#D97706",
        },
        flame: "#FF5C38",
        magenta: "#ff2d78",
        electric: "#00E1C4",
        volt: "#c6ff3a",
      },
      fontFamily: {
        impact: ["var(--font-display)", "Arial Black", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 28px rgba(217,119,6,0.25)",
        "glow-electric": "0 0 28px rgba(0,225,196,0.25)",
        "glow-flame": "0 0 32px rgba(255,92,56,0.30)",
        card: "0 12px 40px rgba(0,0,0,0.50)",
        neon: "0 0 0 1px rgba(255,255,255,0.04), 0 0 40px -8px rgba(0,225,196,0.20)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(3deg)" },
        },
        "pulse-glow": {
          "0%,100%": { opacity: "0.55", filter: "blur(28px)" },
          "50%": { opacity: "1", filter: "blur(36px)" },
        },
        "gradient-shift": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "sweep": {
          "0%": { transform: "translateX(-120%) skewX(-20deg)" },
          "100%": { transform: "translateX(220%) skewX(-20deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.2,0.7,0.2,1) both",
        marquee: "marquee 38s linear infinite",
        "marquee-fast": "marquee 22s linear infinite",
        floaty: "floaty 7s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3.5s ease-in-out infinite",
        "gradient-shift": "gradient-shift 12s ease infinite",
        sweep: "sweep 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;

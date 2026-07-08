/*
 * luxShared.tsx
 * Shared design tokens, color context, font constants, and CSS strings
 * consumed by luxury-landing.tsx and souk-compass.tsx.
 * Kept in a separate file so both pages export only React components
 * (required for Vite Fast Refresh to work without full-page reloads).
 */
import { createContext } from "react";

/* ── Join + footer CSS (injected by both pages) ─────────────────────────────*/
export const LUX_JOIN_FOOTER_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');

  .lux-join-split { display: grid; grid-template-columns: 1fr; }
  @media (min-width: 768px) { .lux-join-split { grid-template-columns: 1fr 1fr; } }

  .lux-section-inner { max-width: 1400px; margin: 0 auto; padding: 0 2rem; }
  @media (min-width: 768px) { .lux-section-inner { padding: 0 3rem; } }

  .lux-footer-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem 2rem;
    padding: 4rem 0 3rem;
  }
  @media (min-width: 640px) { .lux-footer-grid { grid-template-columns: repeat(4, 1fr); } }
  @media (min-width: 1024px) { .lux-footer-grid { grid-template-columns: 1.25fr 1fr 1fr 1fr 1fr 1.25fr; } }

  .lux-footer-brand, .lux-footer-newsletter { grid-column: 1 / -1; }
  @media (min-width: 640px) {
    .lux-footer-brand { grid-column: 1 / 3; }
    .lux-footer-newsletter { grid-column: 3 / 5; }
  }
  @media (min-width: 1024px) {
    .lux-footer-brand { grid-column: 1 / 2; }
    .lux-footer-newsletter { grid-column: 6 / 7; }
  }

  .lux-footer-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;
    padding: 1.25rem 0 1.75rem;
    border-top: 1px solid rgba(255,255,255,0.07);
    text-align: center;
  }
  @media (min-width: 768px) {
    .lux-footer-bottom { flex-direction: row; justify-content: space-between; text-align: start; gap: 1rem; }
  }

  .lux-footer-link:hover { color: rgba(255,255,255,0.80) !important; }
  .lux-social-icon:hover { background: rgba(255,255,255,0.10) !important; border-color: rgba(255,255,255,0.18) !important; color: rgba(255,255,255,0.80) !important; }
  .lux-footer-input:focus { border-color: rgba(255,255,255,0.20) !important; }

  html:not(.dark) .lux-footer-bottom { border-top-color: rgba(17,24,39,0.08); }
  html:not(.dark) .lux-footer-link:hover { color: rgba(17,24,39,0.75) !important; }
  html:not(.dark) .lux-social-icon:hover { background: rgba(17,24,39,0.06) !important; border-color: rgba(17,24,39,0.14) !important; color: rgba(17,24,39,0.60) !important; }
  html:not(.dark) .lux-footer-input:focus { border-color: rgba(22,163,74,0.35) !important; }
`;

/* ── Brand tokens — DARK ─────────────────────────────────────────────────────*/
export const C = {
  bg:         "#1A1A1A",
  card:       "#242424",
  card2:      "#202020",
  white:      "#FFFFFF",
  offWhite:   "#F2F2F0",
  muted:      "rgba(255,255,255,0.52)",
  dimmed:     "rgba(255,255,255,0.28)",
  border:     "rgba(255,255,255,0.08)",
  borderHov:  "rgba(255,255,255,0.16)",
  green:      "#16A34A",
  greenAlpha: "rgba(22,163,74,0.16)",
  greenGlow:  "rgba(22,163,74,0.28)",
} as const;

/* ── Brand tokens — LIGHT ────────────────────────────────────────────────────*/
export const CL = {
  bg:         "#F8FAFC",
  card:       "#FFFFFF",
  card2:      "#EEF0F7",
  white:      "#111827",
  offWhite:   "#111827",
  muted:      "#3D4554",
  dimmed:     "rgba(17,24,39,0.50)",
  border:     "#D1D4E0",
  borderHov:  "rgba(17,24,39,0.22)",
  green:      "#16A34A",
  greenAlpha: "rgba(22,163,74,0.10)",
  greenGlow:  "rgba(22,163,74,0.14)",
} as const;

/* ── Color token type ────────────────────────────────────────────────────────*/
export type ColorTokens = { [K in keyof typeof C]: string };

/* ── Color context ───────────────────────────────────────────────────────────*/
export const LuxColorCtx = createContext<ColorTokens>(C as ColorTokens);

/* ── Font constants ──────────────────────────────────────────────────────────*/
export const F = {
  naskh: "'Noto Naskh Arabic', serif",
  sans:  "'Noto Sans Arabic', sans-serif",
} as const;

/* ── Animation easing ────────────────────────────────────────────────────────*/
export const fadeEase = [0.25, 0.46, 0.45, 0.94] as const;

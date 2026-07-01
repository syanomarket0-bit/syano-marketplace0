---
name: Fluid proportional scaling system
description: How the marketplace achieves "vector graphic" proportional scaling at any viewport width without layout reflow.
---

## Rule
The marketplace uses a three-layer system so the 1440 px design always renders exactly—only smaller—on narrow windows:

1. **Tailwind breakpoints pinned to 1 px** (`--breakpoint-sm/md/lg/xl/2xl: 0.0625rem` in `@theme`). Every responsive class (sm:/md:/lg:/xl:/2xl:) always fires, so the desktop layout is always active.
2. **`body { min-width: 1440px }`** ensures the layout renders at the full design width regardless of viewport.
3. **`useViewportScale()` hook** (`src/hooks/useViewportScale.ts`) sets `document.documentElement.style.zoom = Math.min(1, viewport/1440)` on resize, scaling ALL elements (rem AND px) proportionally.

## Why html.zoom works with fixed navbar
The LuxuryNavbar uses `left: 0; right: 0` (not `width: 100%` alone) on its fixed `<header>`, so it always spans the full viewport width even when the html element is zoomed. Same for modals using `inset: 0`.

## Custom CSS media queries
ALL custom CSS `@media (min-width: Npx)` queries in `index.css` must use rem equivalents so they scale with root font-size (which is fixed at 16 px = 1rem design reference). Conversion table:
- 480px → 30rem
- 640px → 40rem
- 768px → 48rem
- 1024px → 64rem
- 1280px → 80rem
- 1536px → 96rem

## Font-size
`html { font-size: clamp(16px, 1.111vw, 20px) }` — fixed at 16 px for ≤1440 px (zoom handles scaling), gentle growth for large monitors (zoom=1) up to 20 px cap.

## Why
Without breakpoint pinning, responsive Tailwind classes fire at px thresholds relative to the viewport, causing layout reflow (columns collapsing, stacking) at narrower windows. The zoom-on-html approach scales EVERYTHING including hardcoded px values that rem-only scaling misses.

## How to apply
- When adding new custom CSS `@media (min-width: Npx)`, always convert to rem using the table above.
- Never remove the `--breakpoint-*: 0.0625rem` @theme overrides — they are load-bearing for desktop-always layout.
- Never remove `body { min-width: 1440px }` — without it the body collapses to viewport width and zoom would shrink content to a fraction of the screen.

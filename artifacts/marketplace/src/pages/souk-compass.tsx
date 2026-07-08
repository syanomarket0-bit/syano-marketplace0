/*
 * souk-compass.tsx — Souk Compass Homepage (Phase 1)
 * Route: /  (LuxuryLandingPage moved to /luxury)
 *
 * Five-spoke circular compass hero, Arabic-first, with a scrollable
 * storefront section (minimal nav → category tabs → best-sellers → category grids).
 */

import {
  useState, useMemo, useEffect, useRef, useCallback,
  type CSSProperties, type MutableRefObject,
} from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { Search } from "lucide-react";
import {
  useListProducts,
  getListProductsQueryKey,
  type Product,
} from "@workspace/api-client-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "next-themes";
import { CATEGORIES } from "@/lib/categories";
import { COMPASS_CATEGORIES, TRENDING_SLUG, type CompassCategory } from "@/lib/compassCategories";
import { ProductCard } from "@/components/ProductCard";
import { LuxuryNavbar } from "@/components/LuxuryNavbar";
import { LuxColorCtx, C, CL, LUX_JOIN_FOOTER_CSS, type ColorTokens } from "@/lib/luxShared";
import { LuxJoinSection, LuxFooterBar } from "./luxury-landing";

/* ── CSS injection ──────────────────────────────────────────────────────────── */

const COMPASS_CSS = `
@keyframes scPulse {
  0%   { opacity: 0.55; transform: translate(-50%,-50%) scale(1);   }
  70%  { opacity: 0;    transform: translate(-50%,-50%) scale(1.62); }
  100% { opacity: 0;    transform: translate(-50%,-50%) scale(1.62); }
}
.sc-pulse-ring {
  animation: scPulse 2s ease-out infinite;
  position: absolute; left: 50%; top: 50%;
  border-radius: 9999px; pointer-events: none;
}
.sc-thumb:hover .sc-thumb-img { transform: scale(1.07); }
.sc-thumb-img { transition: transform 0.18s ease; will-change: transform; }
.sc-chip:focus-visible  { outline: 2px solid; outline-offset: 2px; border-radius: 9999px; }
.sc-name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
`;

/* ── Compass geometry ───────────────────────────────────────────────────────── */

const S = 560;               // virtual square size used for viewBox / % math
const CX = 280;
const CY = 280;
const HUB_R       = 54;      // hub circle radius
const THUMB_ORBIT = 178;     // thumbnail center distance from S-center
const CHIP_ORBIT  = 248;     // chip center distance from S-center
const RING_INNER  = 158;
const RING_OUTER  = 228;

/* Five spoke angles: clockwise from top → CSS (x-right, y-down) rad */
const ANGLES = [0, 72, 144, 216, 288] as const;

function toRad(cwDeg: number): number {
  return ((cwDeg - 90) * Math.PI) / 180;
}

/* Returns CSS percentage strings for `left` and `top` so positioning scales
   automatically when the container shrinks below S×S.                        */
function pct(orbit: number, i: number): { left: string; top: string } {
  const r = toRad(ANGLES[i]);
  return {
    left: `${(50 + (Math.cos(r) * orbit) / S * 100).toFixed(3)}%`,
    top:  `${(50 + (Math.sin(r) * orbit) / S * 100).toFixed(3)}%`,
  };
}

/* Returns absolute SVG-coordinate point (for SVG line drawing). */
function svgPt(orbit: number, i: number): { x: number; y: number } {
  const r = toRad(ANGLES[i]);
  return { x: CX + Math.cos(r) * orbit, y: CY + Math.sin(r) * orbit };
}

/* ── SVG layer (spokes + decorative circles) ────────────────────────────────── */

function SvgLayer() {
  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      aria-hidden
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        overflow: "visible", pointerEvents: "none",
      } as CSSProperties}
    >
      <circle cx={CX} cy={CY} r={RING_INNER} fill="none" stroke="currentColor"
        strokeWidth="1" strokeDasharray="5 5" opacity="0.13" />
      <circle cx={CX} cy={CY} r={RING_OUTER} fill="none" stroke="currentColor"
        strokeWidth="1" strokeDasharray="5 5" opacity="0.08" />
      {COMPASS_CATEGORIES.map((cat, i) => {
        const a = svgPt(HUB_R + 9, i);
        const b = svgPt(CHIP_ORBIT - 24, i);
        return (
          <line key={cat.slug}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={cat.color} strokeWidth="5" strokeLinecap="round" />
        );
      })}
    </svg>
  );
}

/* ── Hub (center button) ────────────────────────────────────────────────────── */

function Hub({ onSearch }: { onSearch: () => void }) {
  const { t } = useTranslation();
  const d = HUB_R * 2;
  return (
    <button
      onClick={onSearch}
      aria-label={t("compass.hub_aria")}
      style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%,-50%)",
        width: d, height: d, borderRadius: "9999px",
        background: "var(--color-card)",
        border: "1.5px solid var(--color-border)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 2, cursor: "pointer", padding: 0,
        boxShadow: "0 2px 16px rgba(0,0,0,0.09)",
      } as CSSProperties}
    >
      <Search size={15} style={{ opacity: 0.45 }} />
      <span style={{
        fontFamily: "'Cairo', sans-serif", fontWeight: 700,
        fontSize: 11, lineHeight: 1.2, textAlign: "center",
        direction: "rtl", color: "var(--color-foreground)",
        userSelect: "none",
      } as CSSProperties}>
        {t("compass.hub_line1")}<br />{t("compass.hub_line2")}
      </span>
    </button>
  );
}

/* ── Category chip (at spoke end) ───────────────────────────────────────────── */

function Chip({ cat, idx }: { cat: CompassCategory; idx: number }) {
  const arName = useMemo(
    () => CATEGORIES.find(c => c.slug === cat.slug)?.ar ?? cat.slug,
    [cat.slug],
  );
  const { Icon } = cat;
  const pos = pct(CHIP_ORBIT, idx);
  return (
    <Link href={`/categories?c=${encodeURIComponent(cat.slug)}`}>
      <span
        className="sc-chip"
        tabIndex={0}
        style={{
          position: "absolute",
          left: pos.left, top: pos.top,
          transform: "translate(-50%,-50%)",
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 11px", borderRadius: 9999,
          border: `1.5px solid ${cat.color}30`,
          background: `${cat.color}12`,
          cursor: "pointer", whiteSpace: "nowrap", direction: "rtl",
        } as CSSProperties}
      >
        <Icon size={13} color={cat.color} stroke={1.5} />
        <span style={{
          fontSize: 12, fontWeight: 700,
          fontFamily: "'Cairo', sans-serif",
          color: cat.color,
        }}>
          {arName}
        </span>
      </span>
    </Link>
  );
}

/* ── Product thumbnail (midway along spoke) ─────────────────────────────────── */

const THUMB_D = 68;

function Thumb({
  product, cat, idx, isTrending, format, trendingLabel,
}: {
  product: Product;
  cat: CompassCategory;
  idx: number;
  isTrending: boolean;
  format: (n: number) => string;
  trendingLabel: string;
}) {
  const imgs = (product as unknown as { imageUrls?: string[] }).imageUrls;
  const img   = imgs?.[0] ?? product.imageUrl ?? "";
  const price = Number(product.finalPrice ?? product.price);
  const pos   = pct(THUMB_ORBIT, idx);

  return (
    <Link href={`/products/${product.id}`}>
      <div
        className="sc-thumb"
        style={{
          position: "absolute",
          left: pos.left, top: pos.top,
          transform: "translate(-50%,-50%)",
          width: 96, textAlign: "center",
          cursor: "pointer", direction: "rtl",
        } as CSSProperties}
      >
        {/* Image + optional pulse ring */}
        <div style={{ position: "relative", width: THUMB_D, height: THUMB_D, margin: "0 auto" }}>
          {isTrending && (
            <span
              className="sc-pulse-ring"
              style={{
                width: THUMB_D + 18, height: THUMB_D + 18,
                border: `2.5px solid ${cat.color}`,
              } as CSSProperties}
            />
          )}
          <div style={{
            width: THUMB_D, height: THUMB_D, borderRadius: "9999px",
            overflow: "hidden", border: `2px solid ${cat.color}`,
            background: "#f0f0ef",
          }}>
            {img && (
              <img
                className="sc-thumb-img"
                src={img} alt={product.name} loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
        </div>

        {isTrending && (
          <span style={{
            display: "block", fontSize: 9, fontWeight: 800,
            color: cat.color, fontFamily: "'Cairo', sans-serif",
            marginTop: 2, lineHeight: 1,
          }}>
            {trendingLabel}
          </span>
        )}

        <span className="sc-name" style={{
          fontSize: 10, lineHeight: 1.3,
          color: "var(--color-foreground)",
          fontFamily: "'Cairo', sans-serif",
          marginTop: 3, maxWidth: 90, display: "block",
        }}>
          {product.name}
        </span>

        <span style={{
          display: "block", fontSize: 10,
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 500, color: cat.color, marginTop: 2,
        }}>
          {format(price)}
        </span>
      </div>
    </Link>
  );
}

/* ── Compass hero (assembles SVG + hub + chips + thumbs) ────────────────────── */

interface CompassItem {
  cat: CompassCategory;
  idx: number;
  product: Product | null;
  isTrending: boolean;
}

function CompassHero({
  products, format,
}: {
  products: Product[];
  format: (n: number) => string;
}) {
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  const items = useMemo<CompassItem[]>(
    () => COMPASS_CATEGORIES.map((cat, idx) => ({
      cat, idx,
      product: products.find(p => p.category === cat.slug) ?? null,
      isTrending: cat.slug === TRENDING_SLUG,
    })),
    [products],
  );

  return (
    <div style={{
      position: "relative",
      width: "min(calc(100vw - 64px), 560px)",
      aspectRatio: "1 / 1",
      direction: "ltr",
      flexShrink: 0,
      overflow: "visible",
    } as CSSProperties}>
      <SvgLayer />

      {items.map(({ cat, idx }) => (
        <Chip key={cat.slug} cat={cat} idx={idx} />
      ))}

      {items.map(({ cat, idx, product, isTrending }) =>
        product ? (
          <Thumb
            key={`t-${cat.slug}`}
            product={product}
            cat={cat}
            idx={idx}
            isTrending={isTrending}
            format={format}
            trendingLabel={t("compass.trending_label")}
          />
        ) : null,
      )}

      <Hub onSearch={() => navigate("/search")} />
    </div>
  );
}

/* ── Horizontal category tab strip ─────────────────────────────────────────── */

function CategoryTabs({
  active, onSelect, sectionRefs,
}: {
  active: string;
  onSelect: (slug: string) => void;
  sectionRefs: MutableRefObject<Record<string, HTMLElement | null>>;
}) {
  const { t } = useTranslation();

  const scrollTo = useCallback((slug: string) => {
    onSelect(slug);
    if (slug === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      sectionRefs.current[slug]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [onSelect, sectionRefs]);

  const tabStyle = (isActive: boolean, color?: string): CSSProperties => ({
    padding: "10px 18px", whiteSpace: "nowrap",
    fontFamily: "'Cairo', sans-serif", fontSize: 13,
    fontWeight: isActive ? 700 : 500,
    color: isActive ? (color ?? "var(--color-foreground)") : "var(--color-muted-foreground)",
    background: "none", border: "none", cursor: "pointer",
    borderBottom: isActive
      ? `2.5px solid ${color ?? "var(--color-foreground)"}`
      : "2.5px solid transparent",
    transition: "color 0.15s, border-color 0.15s",
  });

  return (
    <div style={{
      position: "sticky", top: 60, zIndex: 40,
      background: "var(--color-background)",
      borderBottom: "1px solid var(--color-border)",
      overflowX: "auto", display: "flex", direction: "rtl",
      scrollbarWidth: "none",
    } as CSSProperties}>
      <button onClick={() => scrollTo("all")} style={tabStyle(active === "all")}>
        {t("compass.all_categories")}
      </button>
      {COMPASS_CATEGORIES.map(cat => {
        const arName = CATEGORIES.find(c => c.slug === cat.slug)?.ar ?? cat.slug;
        return (
          <button key={cat.slug} onClick={() => scrollTo(cat.slug)} style={tabStyle(active === cat.slug, cat.color)}>
            {arName}
          </button>
        );
      })}
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────────── */

export default function SoukCompassPage() {
  const { t } = useTranslation();

  const { data: products = [] } = useListProducts({}, {
    query: { staleTime: 5 * 60 * 1000, queryKey: getListProductsQueryKey({}) },
  });

  const { format }        = useCurrency();
  const { resolvedTheme } = useTheme();
  const lc = (resolvedTheme === "dark" ? C : CL) as ColorTokens;

  const [activeCategory, setActiveCategory] = useState("all");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const bestSellers = useMemo(
    () => [...products]
      .sort((a, b) => (Number(b.reviewCount ?? 0)) - (Number(a.reviewCount ?? 0)))
      .slice(0, 8),
    [products],
  );

  const categorySections = useMemo(
    () => COMPASS_CATEGORIES
      .map(cat => ({
        cat,
        arName: CATEGORIES.find(c => c.slug === cat.slug)?.ar ?? cat.slug,
        items: products.filter(p => p.category === cat.slug).slice(0, 4),
      }))
      .filter(s => s.items.length > 0),
    [products],
  );

  useEffect(() => {
    const el1 = document.createElement("style");
    el1.textContent = COMPASS_CSS;
    document.head.appendChild(el1);

    const el2 = document.createElement("style");
    el2.textContent = LUX_JOIN_FOOTER_CSS;
    document.head.appendChild(el2);

    return () => {
      document.head.removeChild(el1);
      document.head.removeChild(el2);
    };
  }, []);

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
  };

  return (
    <div dir="rtl" style={{
      fontFamily: "'Cairo', sans-serif",
      background: "var(--color-background)",
      color: "var(--color-foreground)",
      minHeight: "100dvh",
    }}>
      {/* ── Compass hero ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100dvh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "32px 0",
      }}>
        <CompassHero products={products} format={format} />
        <p style={{
          marginTop: 28, fontSize: "0.875rem",
          color: "var(--color-muted-foreground)",
          direction: "rtl", textAlign: "center",
        }}>
          {t("compass.scroll_hint")}
        </p>
      </section>

      {/* ── Storefront ───────────────────────────────────────────────── */}
      <LuxuryNavbar />
      <CategoryTabs
        active={activeCategory}
        onSelect={setActiveCategory}
        sectionRefs={sectionRefs}
      />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px" }}>

        {/* Best sellers */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: "'Cairo', sans-serif", fontWeight: 800,
            fontSize: "1.35rem", marginBottom: 20, direction: "rtl",
          }}>
            {t("compass.best_sellers")}
          </h2>
          <div style={gridStyle}>
            {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* Per-category sections */}
        {categorySections.map(({ cat, arName, items }) => (
          <section
            key={cat.slug}
            ref={(el: HTMLElement | null) => { sectionRefs.current[cat.slug] = el; }}
            style={{ marginBottom: 48, scrollMarginTop: 108 }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 20, direction: "rtl",
            }}>
              <h2 style={{
                fontFamily: "'Cairo', sans-serif", fontWeight: 800,
                fontSize: "1.35rem", color: cat.color, margin: 0,
              }}>
                {arName}
              </h2>
              <div style={{
                flex: 1, height: 2,
                background: `linear-gradient(to left, transparent, ${cat.color}30)`,
                borderRadius: 2,
              }} />
              <Link
                href={`/categories?c=${encodeURIComponent(cat.slug)}`}
                style={{
                  fontSize: 13, color: cat.color,
                  fontFamily: "'Cairo', sans-serif",
                  textDecoration: "none", whiteSpace: "nowrap",
                  opacity: 0.85,
                }}
              >
                {t("compass.see_all")} ←
              </Link>
            </div>
            <div style={gridStyle}>
              {items.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        ))}

      </div>

      {/* ── Join CTA + Footer ────────────────────────────────────────── */}
      <LuxColorCtx.Provider value={lc}>
        <LuxJoinSection />
        <LuxFooterBar />
      </LuxColorCtx.Provider>
    </div>
  );
}

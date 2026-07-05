/*
 * compassCategories.ts — Souk Compass category design tokens
 * Single source of truth for the five compass categories:
 * color, CSS custom-property name, and Tabler outline icon.
 *
 * These tokens drive the compass hero and can be propagated
 * to other pages in later tasks via the CSS vars.
 */

import type { ComponentType } from "react";
import {
  IconDeviceMobile,
  IconShirt,
  IconSofa,
  IconSparkles,
  IconApple,
} from "@tabler/icons-react";

export interface TablerIconProps {
  size?: number;
  color?: string;
  stroke?: number;
  className?: string;
}

export interface CompassCategory {
  slug: string;
  color: string;
  cssVar: string;
  Icon: ComponentType<TablerIconProps>;
}

export const COMPASS_CATEGORIES: CompassCategory[] = [
  {
    slug: "Electronics",
    color: "#1B7F72",
    cssVar: "--compass-electronics",
    Icon: IconDeviceMobile,
  },
  {
    slug: "Fashion",
    color: "#B84C6B",
    cssVar: "--compass-fashion",
    Icon: IconShirt,
  },
  {
    slug: "Home & Kitchen",
    color: "#B98A1D",
    cssVar: "--compass-home",
    Icon: IconSofa,
  },
  {
    slug: "Beauty & Personal Care",
    color: "#6B5CA5",
    cssVar: "--compass-beauty",
    Icon: IconSparkles,
  },
  {
    slug: "Supermarket & Grocery",
    color: "#5B7F45",
    cssVar: "--compass-grocery",
    Icon: IconApple,
  },
];

export const TRENDING_SLUG = "Electronics";

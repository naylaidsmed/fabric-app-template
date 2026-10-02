// ✅ NO CHANGES NEEDED. Small helpers shared by every chart.
// Same patterns as datacubeapp: Rupiah values are shown in
// billions ("B") on chart axes, percentages with 1 decimal, and colors come from the theme.

import type { ChartTheme } from '@/lib/chart-theme';
import { toBillions, toNumber } from '@/lib/format';

/**
 * Unit of the numbers passed to a chart.
 * - 'IDR'   : raw Rupiah (e.g. 793923438241). The chart automatically shows it
 *             in billions: "Rp 793.9B". Don't divide it yourself.
 * - 'pct'   : a percentage already multiplied by 100 (e.g. 66.3 for 66.3%).
 * - 'count' : a plain count (e.g. number of funnels, number of tables).
 */
export type ValueUnit = 'IDR' | 'pct' | 'count';

/** Theme colors you can pick for a series/bar/node. Values come from global.css. */
export type ThemeColor = 'brand' | 'navy' | 'sky' | 'good' | 'bad' | 'warn' | 'muted';

export function themeColor(theme: ChartTheme, color: ThemeColor | undefined, index: number): string {
  if (color) return theme[color];
  return theme.series[index % theme.series.length];
}

/** The value drawn on the chart (Rupiah → billions). */
export function toChartValue(value: unknown, unit: ValueUnit): number {
  const n = toNumber(value);
  return unit === 'IDR' ? toBillions(n) : n;
}

/** Axis suffix: "B" for Rupiah billions, "%" for percentages. */
export function axisSuffix(unit: ValueUnit): string {
  if (unit === 'IDR') return 'B';
  if (unit === 'pct') return '%';
  return '';
}

/**
 * Plotly hovertemplate fragment for a single value, e.g. "Rp %{y:,.1f}B".
 * `field` is the Plotly variable: 'y', 'x', 'value'.
 */
export function hoverValue(field: string, unit: ValueUnit): string {
  if (unit === 'IDR') return `Rp %{${field}:,.1f}B`;
  if (unit === 'pct') return `%{${field}:,.1f}%`;
  return `%{${field}:,}`;
}

/** Axis/category label from a field value: date → "Sep 26", anything else → text. */
export function toLabel(value: unknown, formatDate: (d: Date) => string): string {
  if (value instanceof Date) return formatDate(value);
  return value == null ? '' : String(value);
}

/** Long names are truncated on the axis; the full name still appears on hover. */
export function shorten(name: string, max = 26): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

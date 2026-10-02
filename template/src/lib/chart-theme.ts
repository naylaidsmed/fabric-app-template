// ✅ TIDAK PERLU DIUBAH. Diambil apa adanya dari datacubeapp (lib/chart-theme.ts).
// Warna chart dibaca dari CSS token di global.css saat app berjalan, jadi chart
// otomatis ikut mode terang/gelap. Mau ganti warna? Ubah token di global.css.

import { useSyncExternalStore } from 'react';
import type { Layout } from 'plotly.js';

/**
 * Chart colors resolved from the CSS tokens in global.css.
 *
 * Plotly renders SVG with literal colors, so the tokens are read from the
 * computed style and re-read whenever the root `class` changes (light/dark).
 */
export interface ChartTheme {
  series: string[];
  text: string;
  muted: string;
  grid: string;
  good: string;
  bad: string;
  warn: string;
  navy: string;
  sky: string;
  ice: string;
  brand: string;
  card: string;
}

// Fallbacks keep charts legible where computed styles are unavailable (tests).
const FALLBACK: ChartTheme = {
  series: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'],
  text: '#0b1220',
  muted: '#5b6b82',
  grid: '#e6edf7',
  good: '#0a7a0a',
  bad: '#b42222',
  warn: '#9a6b00',
  navy: '#0f2a5e',
  sky: '#3987e5',
  ice: '#cde2fb',
  brand: '#2a78d6',
  card: '#ffffff',
};

function readChartTheme(): ChartTheme {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;

  return {
    series: FALLBACK.series.map((color, i) =>
      token(`--color-chart-${i + 1}`, color)
    ),
    text: token('--color-chart-text', FALLBACK.text),
    muted: token('--color-muted-foreground', FALLBACK.muted),
    grid: token('--color-chart-grid', FALLBACK.grid),
    good: token('--color-good', FALLBACK.good),
    bad: token('--color-bad', FALLBACK.bad),
    warn: token('--color-warn', FALLBACK.warn),
    navy: token('--color-navy', FALLBACK.navy),
    sky: token('--color-sky', FALLBACK.sky),
    ice: token('--color-ice', FALLBACK.ice),
    brand: token('--color-brand', FALLBACK.brand),
    card: token('--color-card', FALLBACK.card),
  };
}

let snapshot: ChartTheme | undefined;
const listeners = new Set<() => void>();
let observer: MutationObserver | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!observer) {
    observer = new MutationObserver(() => {
      snapshot = readChartTheme();
      listeners.forEach((notify) => notify());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = undefined;
      snapshot = undefined;
    }
  };
}

function getSnapshot() {
  snapshot ??= readChartTheme();
  return snapshot;
}

export function useChartTheme(): ChartTheme {
  return useSyncExternalStore(subscribe, getSnapshot, () => FALLBACK);
}

/** Shared Plotly layout: transparent, compact, system-ui, English separators. */
export function baseLayout(theme: ChartTheme): Partial<Layout> {
  const axis = {
    gridcolor: theme.grid,
    zerolinecolor: theme.grid,
    linecolor: theme.grid,
    tickfont: { color: theme.muted },
    automargin: true,
  };
  return {
    font: { family: 'system-ui, -apple-system, "Segoe UI", sans-serif', color: theme.text, size: 12 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { l: 48, r: 16, t: 10, b: 36 },
    separators: '.,',
    colorway: theme.series,
    showlegend: false,
    hoverlabel: { font: { family: 'system-ui, -apple-system, "Segoe UI", sans-serif' } },
    xaxis: axis,
    yaxis: axis,
  };
}

/** Transparent variant of a hex color for fills and sankey links. */
export function withAlpha(hex: string, alpha: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;
  const n = parseInt(match[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

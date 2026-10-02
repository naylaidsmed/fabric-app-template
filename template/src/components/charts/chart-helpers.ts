// ✅ TIDAK PERLU DIUBAH. Helper kecil yang dipakai bersama oleh semua chart.
// Isinya pola yang sama dengan datacubeapp: nilai Rupiah ditampilkan dalam
// miliar ("B") di sumbu chart, persen dengan 1 desimal, dan warna diambil dari tema.

import type { ChartTheme } from '@/lib/chart-theme';
import { toBillions, toNumber } from '@/lib/format';

/**
 * Satuan angka yang dikirim ke chart.
 * - 'IDR'   : Rupiah mentah (mis. 793923438241). Chart otomatis menampilkannya
 *             dalam miliar: "Rp 793.9B". Jangan dibagi sendiri.
 * - 'pct'   : persen yang sudah dikali 100 (mis. 66.3 untuk 66,3%).
 * - 'count' : jumlah biasa (mis. jumlah funnel, jumlah tabel).
 */
export type ValueUnit = 'IDR' | 'pct' | 'count';

/** Warna tema yang boleh dipilih untuk seri/bar/node. Nilainya dari global.css. */
export type ThemeColor = 'brand' | 'navy' | 'sky' | 'good' | 'bad' | 'warn' | 'muted';

export function themeColor(theme: ChartTheme, color: ThemeColor | undefined, index: number): string {
  if (color) return theme[color];
  return theme.series[index % theme.series.length];
}

/** Nilai yang digambar di chart (Rupiah → miliar). */
export function toChartValue(value: unknown, unit: ValueUnit): number {
  const n = toNumber(value);
  return unit === 'IDR' ? toBillions(n) : n;
}

/** Akhiran sumbu: "B" untuk Rupiah miliar, "%" untuk persen. */
export function axisSuffix(unit: ValueUnit): string {
  if (unit === 'IDR') return 'B';
  if (unit === 'pct') return '%';
  return '';
}

/**
 * Potongan hovertemplate Plotly untuk satu nilai, mis. "Rp %{y:,.1f}B".
 * `field` adalah variabel Plotly-nya: 'y', 'x', 'value'.
 */
export function hoverValue(field: string, unit: ValueUnit): string {
  if (unit === 'IDR') return `Rp %{${field}:,.1f}B`;
  if (unit === 'pct') return `%{${field}:,.1f}%`;
  return `%{${field}:,}`;
}

/** Label sumbu/kategori dari isi kolom: tanggal → "Sep 26", lainnya → teks. */
export function toLabel(value: unknown, formatDate: (d: Date) => string): string {
  if (value instanceof Date) return formatDate(value);
  return value == null ? '' : String(value);
}

/** Nama panjang dipotong di sumbu; nama lengkap tetap muncul saat hover. */
export function shorten(name: string, max = 26): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

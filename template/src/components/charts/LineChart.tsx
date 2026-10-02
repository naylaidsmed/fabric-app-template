// 📈 LineChart — satu atau beberapa garis di sepanjang waktu/kategori.
// Diambil dari datacubeapp: "Monthly Revenue Trend" (garis + area + target
// putus-putus) dan "Gross Margin % Trend" (garis + titik).
//
// Bentuk data (satu baris = satu titik di sumbu X):
//   [{ month: Date | 'Sep 26', revenue: 12000000000, target: 12500000000 }, ...]
//   - kolom X  : tanggal (Date → tampil "Sep 26") atau teks
//   - kolom Y  : angka, satu kolom per garis
// Urutkan data dari yang paling lama ke paling baru sebelum dikirim.
//
// Contoh:
//   <LineChart
//     data={rows} x="month" unit="IDR"
//     lines={[{ key: 'revenue', name: 'Revenue', area: true },
//             { key: 'target', name: 'Target', dashed: true }]}
//     label="Monthly revenue vs target, IDR billions"
//   />
// Tip: definisikan `lines` di luar komponen (konstanta) supaya chart tidak
// digambar ulang setiap render.

import { useMemo } from 'react';

import { PlotlyChart, type Figure } from '@/components/plotly-chart';
import { useChartTheme, withAlpha } from '@/lib/chart-theme';
import { formatMonth } from '@/lib/format';

import {
  axisSuffix,
  hoverValue,
  themeColor,
  toChartValue,
  toLabel,
  type ThemeColor,
  type ValueUnit,
} from './chart-helpers';

export interface LineSeries<T> {
  /** Kolom angka untuk garis ini. */
  key: keyof T & string;
  /** Nama di legend dan hover. */
  name: string;
  /** Garis putus-putus — cocok untuk target/pembanding. */
  dashed?: boolean;
  /** Isi area di bawah garis — cocok untuk seri utama. */
  area?: boolean;
  /** Tampilkan titik di setiap nilai. */
  markers?: boolean;
  color?: ThemeColor;
}

export interface LineChartProps<T> {
  data: T[];
  /** Kolom untuk sumbu X (tanggal atau teks). */
  x: keyof T & string;
  lines: LineSeries<T>[];
  unit?: ValueUnit;
  height?: number;
  /** Deskripsi chart untuk pembaca layar (aksesibilitas). */
  label: string;
}

export function LineChart<T>({ data, x, lines, unit = 'count', height, label }: LineChartProps<T>) {
  const theme = useChartTheme();
  const figure = useMemo<Figure>(() => {
    const xs = data.map((row) => toLabel(row[x], formatMonth));
    return {
      data: lines.map((line, i) => {
        const color = themeColor(theme, line.color, i);
        return {
          type: 'scatter',
          mode: line.markers ? 'lines+markers' : 'lines',
          name: line.name,
          x: xs,
          y: data.map((row) => toChartValue(row[line.key], unit)),
          line: { color, width: 2, ...(line.dashed ? { dash: 'dot' } : {}) },
          ...(line.markers ? { marker: { size: 6, color } } : {}),
          ...(line.area ? { fill: 'tozeroy', fillcolor: withAlpha(color, 0.12) } : {}),
          hovertemplate: `%{x}: ${hoverValue('y', unit)}<extra>${line.name}</extra>`,
        };
      }),
      layout: {
        showlegend: lines.length > 1,
        legend: { orientation: 'h', y: 1.12, x: 0 },
        margin: { t: lines.length > 1 ? 24 : 10 },
        yaxis: { ticksuffix: axisSuffix(unit) },
      },
    };
  }, [data, x, lines, unit, theme]);

  return <PlotlyChart {...figure} height={height} label={label} />;
}

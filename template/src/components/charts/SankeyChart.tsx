// 🔀 SankeyChart — aliran dari kolom kiri (asal) ke kolom kanan (tujuan).
// Diambil dari datacubeapp: "Funnel Flow" (funnel → status) dan
// "Lineage: Source → Schema" (database asal → schema warehouse).
//
// Bentuk data (satu baris = satu aliran asal → tujuan):
//   [{ from: 'Funnels created', to: 'Won',  amount: 4000000000 },
//    { from: 'Funnels created', to: 'Lost', amount: 2500000000 }]
//   - kolom asal / tujuan : teks
//   - kolom nilai         : angka (lebar aliran)
// Satu tingkat saja (kiri → kanan). Nama di kiri dan kanan boleh sama tanpa
// bentrok, karena tiap sisi digambar terpisah.
//
// Contoh:
//   <SankeyChart data={flows} sourceKey="from" targetKey="to" valueKey="amount"
//     unit="IDR" nodeColors={{ Won: 'good', Lost: 'bad' }}
//     label="Funnel value by status, IDR billions" />

import { useMemo } from 'react';

import { PlotlyChart, type Figure } from '@/components/plotly-chart';
import { useChartTheme, withAlpha } from '@/lib/chart-theme';

import { hoverValue, toChartValue, type ThemeColor, type ValueUnit } from './chart-helpers';

export interface SankeyChartProps<T> {
  data: T[];
  sourceKey: keyof T & string;
  targetKey: keyof T & string;
  valueKey: keyof T & string;
  unit?: ValueUnit;
  /** Warna per nama node, mis. { Won: 'good', Lost: 'bad' }. */
  nodeColors?: Record<string, ThemeColor>;
  height?: number;
  label: string;
}

export function SankeyChart<T>({
  data,
  sourceKey,
  targetKey,
  valueKey,
  unit = 'count',
  nodeColors = {},
  height,
  label,
}: SankeyChartProps<T>) {
  const theme = useChartTheme();
  const figure = useMemo<Figure>(() => {
    // Urutan node = urutan kemunculan di data, jadi kamu mengatur urutannya.
    const unique = (key: keyof T & string) => [...new Set(data.map((row) => String(row[key] ?? '')))];
    const sources = unique(sourceKey);
    const targets = unique(targetKey);
    const colorOf = (name: string, fallback: string) => {
      const pick = nodeColors[name];
      return pick ? theme[pick] : fallback;
    };
    const targetColors = targets.map((name) => colorOf(name, theme.series[2]));

    return {
      data: [
        {
          type: 'sankey',
          orientation: 'h',
          valueformat: unit === 'IDR' ? ',.1f' : ',',
          valuesuffix: unit === 'IDR' ? 'B' : unit === 'pct' ? '%' : '',
          node: {
            pad: 16,
            thickness: 16,
            line: { width: 0 },
            label: [...sources, ...targets],
            color: [...sources.map((name) => colorOf(name, theme.brand)), ...targetColors],
          },
          link: {
            source: data.map((row) => sources.indexOf(String(row[sourceKey] ?? ''))),
            target: data.map((row) => sources.length + targets.indexOf(String(row[targetKey] ?? ''))),
            value: data.map((row) => toChartValue(row[valueKey], unit)),
            color: data.map((row) =>
              withAlpha(targetColors[targets.indexOf(String(row[targetKey] ?? ''))], 0.3)
            ),
            hovertemplate: `%{source.label} → %{target.label}: ${hoverValue('value', unit)}<extra></extra>`,
          },
        },
      ],
      layout: { margin: { l: 8, r: 8, t: 10, b: 8 } },
    };
  }, [data, sourceKey, targetKey, valueKey, unit, nodeColors, theme]);

  return <PlotlyChart {...figure} height={height} label={label} />;
}

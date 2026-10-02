// 🔻 FunnelChart — jumlah yang tersisa di setiap tahap, dari atas ke bawah.
// Diambil dari datacubeapp: "Funnel Conversion" (created → decided → won).
//
// Bentuk data (satu baris = satu tahap, urut dari tahap pertama):
//   [{ stage: 'Funnels created', count: 120 },
//    { stage: 'Decided (Won + Lost)', count: 70 },
//    { stage: 'Won', count: 45 }]
//
// Contoh:
//   <FunnelChart data={stages} stageKey="stage" valueKey="count"
//     unitName="funnels" label="Funnel conversion: created, decided, won" />
//
// Teks di tiap tahap = nilai + persen terhadap tahap pertama.

import { useMemo } from 'react';

import { PlotlyChart, type Figure } from '@/components/plotly-chart';
import { useChartTheme } from '@/lib/chart-theme';
import { toNumber } from '@/lib/format';

export interface FunnelChartProps<T> {
  data: T[];
  stageKey: keyof T & string;
  valueKey: keyof T & string;
  /** Kata satuan saat hover, mis. "funnels". */
  unitName?: string;
  /** Lebar area nama tahap di kiri (px). */
  labelWidth?: number;
  height?: number;
  label: string;
}

export function FunnelChart<T>({
  data,
  stageKey,
  valueKey,
  unitName = '',
  labelWidth = 150,
  height,
  label,
}: FunnelChartProps<T>) {
  const theme = useChartTheme();
  const figure = useMemo<Figure>(() => {
    const palette = [theme.navy, theme.brand, ...theme.series.slice(2)];
    return {
      data: [
        {
          type: 'funnel',
          y: data.map((row) => String(row[stageKey] ?? '')),
          x: data.map((row) => toNumber(row[valueKey])),
          textinfo: 'value+percent initial',
          marker: { color: data.map((_, i) => palette[i % palette.length]) },
          connector: { line: { color: theme.grid } },
          hovertemplate: `%{y}: %{x:,} ${unitName}<extra></extra>`,
        },
      ],
      layout: { margin: { l: labelWidth, r: 16, t: 10, b: 20 } },
    };
  }, [data, stageKey, valueKey, unitName, labelWidth, theme]);

  return <PlotlyChart {...figure} height={height} label={label} />;
}

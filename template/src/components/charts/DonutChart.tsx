// 🍩 DonutChart — porsi tiap kategori dari total, dengan angka total di tengah.
// Diambil dari datacubeapp: "Table Migration Status".
//
// Bentuk data (satu baris = satu irisan, SUDAH dijumlahkan per kategori):
//   [{ status: 'Loaded', tables: 59 }, { status: 'Empty', tables: 1 }]
//   - kolom label : teks
//   - kolom nilai : angka
//
// Contoh:
//   <DonutChart data={rows} labelKey="status" valueKey="tables" unitName="tables"
//     colors={{ Loaded: 'good', Empty: 'bad' }}
//     label="Table migration status" />

import { useMemo } from 'react';

import { PlotlyChart, type Figure } from '@/components/plotly-chart';
import { useChartTheme } from '@/lib/chart-theme';
import { formatCount, toNumber } from '@/lib/format';

import { themeColor, type ThemeColor } from './chart-helpers';

export interface DonutChartProps<T> {
  data: T[];
  labelKey: keyof T & string;
  valueKey: keyof T & string;
  /** Kata satuan di tengah donut dan saat hover, mis. "tables". */
  unitName?: string;
  /** Warna per label, mis. { Loaded: 'good', Empty: 'bad' }. Sisanya warna palet. */
  colors?: Record<string, ThemeColor>;
  height?: number;
  label: string;
}

export function DonutChart<T>({
  data,
  labelKey,
  valueKey,
  unitName = '',
  colors = {},
  height,
  label,
}: DonutChartProps<T>) {
  const theme = useChartTheme();
  const figure = useMemo<Figure>(() => {
    const labels = data.map((row) => String(row[labelKey] ?? ''));
    const values = data.map((row) => toNumber(row[valueKey]));
    const total = values.reduce((sum, v) => sum + v, 0);
    return {
      data: [
        {
          type: 'pie',
          hole: 0.6,
          labels,
          values,
          marker: {
            colors: labels.map((name, i) => themeColor(theme, colors[name], i)),
            line: { color: theme.card, width: 2 },
          },
          textinfo: 'label+value',
          sort: false,
          hovertemplate: `%{label}: %{value} ${unitName}<extra></extra>`,
        },
      ],
      layout: {
        margin: { l: 10, r: 10, t: 10, b: 10 },
        annotations: [
          {
            text: `<b>${formatCount(total)}</b><br>${unitName}`,
            showarrow: false,
            font: { size: 16, color: theme.text },
          },
        ],
      },
    };
  }, [data, labelKey, valueKey, unitName, colors, theme]);

  return <PlotlyChart {...figure} height={height} label={label} />;
}

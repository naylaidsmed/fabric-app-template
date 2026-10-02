// 🔻 FunnelChart — how many remain at each stage, from top to bottom.
// Taken from datacubeapp: "Funnel Conversion" (created → decided → won).
//
// Data shape (one row = one stage, starting from the first stage):
//   [{ stage: 'Funnels created', count: 120 },
//    { stage: 'Decided (Won + Lost)', count: 70 },
//    { stage: 'Won', count: 45 }]
//
// Example:
//   <FunnelChart data={stages} stageKey="stage" valueKey="count"
//     unitName="funnels" label="Funnel conversion: created, decided, won" />
//
// Text on each stage = value + percent of the first stage.

import { useMemo } from 'react';

import { PlotlyChart, type Figure } from '@/components/plotly-chart';
import { useChartTheme } from '@/lib/chart-theme';
import { toNumber } from '@/lib/format';

export interface FunnelChartProps<T> {
  data: T[];
  stageKey: keyof T & string;
  valueKey: keyof T & string;
  /** Unit word on hover, e.g. "funnels". */
  unitName?: string;
  /** Width of the stage-name area on the left (px). */
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

// 🎯 GaugeChart — a single percentage against a 100% target.
// Taken from datacubeapp: "Target Achievement".
//
// Data shape: ONE percentage number (already multiplied by 100), e.g. 87.4 for 87.4%.
//
// Example:
//   <GaugeChart value={87.4} label="Year-to-date target achievement 87.4%" />
//
// Background bands: 0–70 pale, 70–90 medium, 90–120 full; navy line = 100%.
// Small number below = difference from 100 (green above, red below).

import { useMemo } from 'react';

import { PlotlyChart, type Figure } from '@/components/plotly-chart';
import { useChartTheme, withAlpha } from '@/lib/chart-theme';

export interface GaugeChartProps {
  /** Achievement percentage, e.g. 87.4. */
  value: number;
  height?: number;
  label: string;
}

export function GaugeChart({ value, height, label }: GaugeChartProps) {
  const theme = useChartTheme();
  const figure = useMemo<Figure>(
    () => ({
      data: [
        {
          type: 'indicator',
          mode: 'gauge+number+delta',
          value,
          number: { suffix: '%', valueformat: ',.1f' },
          delta: {
            reference: 100,
            valueformat: ',.1f',
            increasing: { color: theme.good },
            decreasing: { color: theme.bad },
          },
          gauge: {
            axis: { range: [0, Math.max(120, Math.ceil(value / 10) * 10 + 10)] },
            bar: { color: theme.brand },
            bgcolor: 'rgba(0,0,0,0)',
            borderwidth: 0,
            steps: [
              { range: [0, 70], color: withAlpha(theme.ice, 0.45) },
              { range: [70, 90], color: withAlpha(theme.ice, 0.8) },
              { range: [90, 120], color: theme.ice },
            ],
            threshold: { line: { color: theme.navy, width: 3 }, value: 100 },
          },
        },
      ],
      layout: { margin: { l: 24, r: 24, t: 24, b: 8 } },
    }),
    [value, theme]
  );
  return <PlotlyChart {...figure} height={height} label={label} />;
}

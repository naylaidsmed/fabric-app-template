// 🪜 WaterfallChart — from a starting number, through increases/decreases, to a total.
// Taken from datacubeapp: "Gross Profit Waterfall" (Revenue → COGS → Gross Profit).
//
// Data shape (ordered left to right):
//   [{ label: 'Revenue',      value: 100000000000, measure: 'absolute' },
//    { label: 'COGS',         value: -60000000000, measure: 'relative' },
//    { label: 'Gross Profit', value: 0,            measure: 'total' }]
//   - measure 'absolute' : the starting point
//   - measure 'relative' : an increase (positive) or a decrease (NEGATIVE)
//   - measure 'total'    : computed automatically by the chart; set value to 0
//
// Example:
//   <WaterfallChart steps={steps} unit="IDR"
//     label="Waterfall of revenue, COGS and gross profit" />

import { useMemo } from 'react';

import { PlotlyChart, type Figure } from '@/components/plotly-chart';
import { useChartTheme } from '@/lib/chart-theme';

import { axisSuffix, hoverValue, toChartValue, type ValueUnit } from './chart-helpers';

export interface WaterfallStep {
  label: string;
  value: number;
  measure: 'absolute' | 'relative' | 'total';
}

export interface WaterfallChartProps {
  steps: WaterfallStep[];
  unit?: ValueUnit;
  height?: number;
  label: string;
}

export function WaterfallChart({ steps, unit = 'IDR', height = 320, label }: WaterfallChartProps) {
  const theme = useChartTheme();
  const figure = useMemo<Figure>(
    () => ({
      data: [
        {
          type: 'waterfall',
          orientation: 'v',
          measure: steps.map((s) => s.measure),
          x: steps.map((s) => s.label),
          y: steps.map((s) => toChartValue(s.value, unit)),
          // 'total' bars are 0 in the data, so their label uses %{final} (the total
          // Plotly computes), not %{y}, which would show 0.
          texttemplate: steps.map((s) => hoverValue(s.measure === 'total' ? 'final' : 'y', unit)),
          textposition: 'outside',
          connector: { line: { color: theme.grid } },
          increasing: { marker: { color: theme.series[2] } },
          decreasing: { marker: { color: theme.bad } },
          totals: { marker: { color: theme.brand } },
          hovertemplate: steps.map(
            (s) => `%{x}: ${hoverValue(s.measure === 'total' ? 'final' : 'y', unit)}<extra></extra>`
          ),
        },
      ],
      layout: { margin: { l: 56, r: 16, t: 24, b: 40 }, yaxis: { ticksuffix: axisSuffix(unit) } },
    }),
    [steps, unit, theme]
  );
  return <PlotlyChart {...figure} height={height} label={label} />;
}

// 🪜 WaterfallChart — dari satu angka awal, ditambah/dikurangi, sampai total.
// Diambil dari datacubeapp: "Gross Profit Waterfall" (Revenue → COGS → Gross Profit).
//
// Bentuk data (urut dari kiri ke kanan):
//   [{ label: 'Revenue',      value: 100000000000, measure: 'absolute' },
//    { label: 'COGS',         value: -60000000000, measure: 'relative' },
//    { label: 'Gross Profit', value: 0,            measure: 'total' }]
//   - measure 'absolute' : titik awal
//   - measure 'relative' : penambah (positif) atau pengurang (NEGATIF)
//   - measure 'total'    : dihitung otomatis oleh chart, isi value 0
//
// Contoh:
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
          // Bar 'total' diisi 0 di data, jadi labelnya pakai %{final} (total hasil
          // hitungan Plotly), bukan %{y} yang akan menampilkan 0.
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

// 📈 LineChart — one or more lines across time/categories.
// Taken from datacubeapp: "Monthly Revenue Trend" (line + area + dashed
// target) and "Gross Margin % Trend" (line + markers).
//
// Data shape (one row = one point on the X axis):
//   [{ month: Date | 'Sep 26', revenue: 12000000000, target: 12500000000 }, ...]
//   - X field  : a date (Date → shown as "Sep 26") or text
//   - Y fields : numbers, one field per line
// Sort the data from oldest to newest before passing it in.
//
// Example:
//   <LineChart
//     data={rows} x="month" unit="IDR"
//     lines={[{ key: 'revenue', name: 'Revenue', area: true },
//             { key: 'target', name: 'Target', dashed: true }]}
//     label="Monthly revenue vs target, IDR billions"
//   />
// Tip: define `lines` outside the component (as a constant) so the chart isn't
// redrawn on every render.

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
  /** Numeric field for this line. */
  key: keyof T & string;
  /** Name in the legend and on hover. */
  name: string;
  /** Dashed line — good for targets/comparisons. */
  dashed?: boolean;
  /** Fill the area under the line — good for the main series. */
  area?: boolean;
  /** Show a marker at every value. */
  markers?: boolean;
  color?: ThemeColor;
}

export interface LineChartProps<T> {
  data: T[];
  /** Field for the X axis (date or text). */
  x: keyof T & string;
  lines: LineSeries<T>[];
  unit?: ValueUnit;
  height?: number;
  /** Chart description for screen readers (accessibility). */
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

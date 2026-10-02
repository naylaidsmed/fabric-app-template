// 📊 BarChart — horizontal (Top-N) or vertical bars, one or more series.
// Taken from datacubeapp: "Revenue by City", "Top 10 Customers",
// "Revenue by Principal" (horizontal), "Actual vs Target by Branch",
// "Revenue vs COGS" (vertical, 2 series side by side), "Rows per Schema".
//
// Data shape (one row = one category/bar):
//   [{ branch: 'JAKARTA', revenue: 50000000000, target: 60000000000 }, ...]
//   - category field : text (customer name, city, month, ...)
//   - value fields   : numbers, one field per series
// Bar order = data order. For Top-N, sort largest first.
//
// Example:
//   <BarChart data={customers} category="name" unit="IDR" topN={10}
//     bars={[{ key: 'revenue', name: 'Revenue', color: 'navy' }]}
//     label="Top 10 customers by revenue, IDR billions" />

import { useMemo } from 'react';

import { PlotlyChart, type Figure } from '@/components/plotly-chart';
import { useChartTheme } from '@/lib/chart-theme';
import { formatMonth } from '@/lib/format';

import {
  axisSuffix,
  hoverValue,
  shorten,
  themeColor,
  toChartValue,
  toLabel,
  type ThemeColor,
  type ValueUnit,
} from './chart-helpers';

export interface BarSeries<T> {
  key: keyof T & string;
  name: string;
  color?: ThemeColor;
}

export interface BarChartProps<T> {
  data: T[];
  /** Category name field. */
  category: keyof T & string;
  bars: BarSeries<T>[];
  /** 'h' = horizontal (good for long names / Top-N), 'v' = vertical. */
  orientation?: 'h' | 'v';
  unit?: ValueUnit;
  /** Only show the first N categories. */
  topN?: number;
  height?: number;
  /** Width of the left label area (px) for horizontal bars. */
  labelWidth?: number;
  label: string;
}

export function BarChart<T>({
  data,
  category,
  bars,
  orientation = 'h',
  unit = 'count',
  topN,
  height,
  labelWidth = 120,
  label,
}: BarChartProps<T>) {
  const theme = useChartTheme();
  const figure = useMemo<Figure>(() => {
    const rows = topN ? data.slice(0, topN) : data;
    const names = rows.map((row) => toLabel(row[category], formatMonth));
    const horizontal = orientation === 'h';
    const value = horizontal ? 'x' : 'y';
    const group = bars.length > 1;

    return {
      data: bars.map((bar, i) => {
        const values = rows.map((row) => toChartValue(row[bar.key], unit));
        return {
          type: 'bar',
          orientation,
          name: bar.name,
          ...(horizontal
            ? { y: names.map((n) => shorten(n)), x: values, customdata: names }
            : { x: names, y: values, customdata: names }),
          marker: { color: themeColor(theme, bar.color, i) },
          hovertemplate: `%{customdata}: ${hoverValue(value, unit)}<extra>${group ? bar.name : ''}</extra>`,
        };
      }),
      layout: {
        ...(group
          ? { barmode: 'group', showlegend: true, legend: { orientation: 'h', y: 1.12, x: 0 } }
          : {}),
        margin: horizontal
          ? { l: labelWidth, r: 16, t: group ? 24 : 10, b: 30 }
          : { l: 48, r: 16, t: group ? 24 : 10, b: 60 },
        ...(horizontal
          ? { yaxis: { autorange: 'reversed' }, xaxis: { ticksuffix: axisSuffix(unit) } }
          : { yaxis: { ticksuffix: axisSuffix(unit) } }),
      },
    };
  }, [data, category, bars, orientation, unit, topN, labelWidth, theme]);

  return <PlotlyChart {...figure} height={height} label={label} />;
}

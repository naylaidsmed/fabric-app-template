// 🟦 TreemapChart — tiles sized by value; color shows a second number.
// Taken from datacubeapp: "Gross Profit by Care Area"
// (size = gross profit, color = margin %).
//
// Data shape (one row = one tile):
//   [{ area: 'Cardiology', grossProfit: 40000000000, marginPct: 40 }, ...]
//   - label field : text
//   - size field  : number (only values > 0 are drawn)
//   - color field : percentage number, optional (higher = darker/navy)
//
// Example:
//   <TreemapChart data={areas} labelKey="area" valueKey="grossProfit" unit="IDR"
//     colorKey="marginPct" colorName="Margin"
//     label="Gross profit by care area; darker means higher margin" />

import { useMemo } from 'react';

import { PlotlyChart, type Figure } from '@/components/plotly-chart';
import { useChartTheme } from '@/lib/chart-theme';
import { toNumber } from '@/lib/format';

import { hoverValue, toChartValue, type ValueUnit } from './chart-helpers';

export interface TreemapChartProps<T> {
  data: T[];
  labelKey: keyof T & string;
  valueKey: keyof T & string;
  unit?: ValueUnit;
  /** Percentage field for the color (optional). Without it, color follows size. */
  colorKey?: keyof T & string;
  /** Name of the color number on hover, e.g. "Margin". */
  colorName?: string;
  height?: number;
  label: string;
}

export function TreemapChart<T>({
  data,
  labelKey,
  valueKey,
  unit = 'IDR',
  colorKey,
  colorName = '',
  height = 320,
  label,
}: TreemapChartProps<T>) {
  const theme = useChartTheme();
  const figure = useMemo<Figure>(() => {
    const positive = data.filter((row) => toNumber(row[valueKey]) > 0);
    const colorValues = positive.map((row) => toNumber(colorKey ? row[colorKey] : row[valueKey]));
    const valueText = hoverValue('value', unit);
    return {
      data: [
        {
          type: 'treemap',
          labels: positive.map((row) => String(row[labelKey] ?? '')),
          parents: positive.map(() => ''),
          values: positive.map((row) => toChartValue(row[valueKey], unit)),
          customdata: colorValues,
          textinfo: 'label+value',
          texttemplate: `%{label}<br>${valueText}`,
          hovertemplate: colorKey
            ? `%{label}<br>${valueText}<br>${colorName} %{customdata:,.1f}%<extra></extra>`
            : `%{label}<br>${valueText}<extra></extra>`,
          marker: {
            colors: colorValues,
            colorscale: [
              [0, theme.ice],
              [1, theme.navy],
            ],
            line: { color: theme.card, width: 2 },
          },
        },
      ],
      layout: { margin: { l: 6, r: 6, t: 6, b: 6 } },
    };
  }, [data, labelKey, valueKey, unit, colorKey, colorName, theme]);

  return <PlotlyChart {...figure} height={height} label={label} />;
}

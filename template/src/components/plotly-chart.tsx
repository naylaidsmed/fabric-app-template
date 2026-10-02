// ✅ NO CHANGES NEEDED. Taken as-is from datacubeapp (components/plotly-chart.tsx).
// Plotly wrapper: loads Plotly only when the first chart appears (the file is ~4.6 MB),
// follows the card's width, and uses the theme from chart-theme.ts. Every chart in
// components/charts/ draws through this component.

import { useEffect, useRef, useState } from 'react';
import type { Config, Data, Layout } from 'plotly.js';

import { baseLayout, useChartTheme } from '@/lib/chart-theme';

/**
 * A Plotly trace. Kept loose on purpose: @types/plotly.js does not model every
 * trace type the dashboard uses (sankey, indicator, treemap, funnel, waterfall).
 */
export type Trace = Record<string, unknown>;

export interface Figure {
  data: Trace[];
  layout?: Partial<Layout>;
}

type PlotlyModule = typeof import('plotly.js');

// Plotly is ~4.6 MB, so it loads once, on the first chart, not with the app.
let plotlyModule: Promise<PlotlyModule> | undefined;
function loadPlotly(): Promise<PlotlyModule> {
  plotlyModule ??= import('plotly.js-dist-min').then(
    (module) => module.default as unknown as PlotlyModule
  );
  return plotlyModule;
}

const CONFIG: Partial<Config> = {
  displayModeBar: false,
  responsive: true,
};

function mergeLayout(
  base: Partial<Layout>,
  layout: Partial<Layout> = {}
): Partial<Layout> {
  return {
    ...base,
    ...layout,
    margin: { ...base.margin, ...layout.margin },
    font: { ...base.font, ...layout.font },
    xaxis: { ...base.xaxis, ...layout.xaxis },
    yaxis: { ...base.yaxis, ...layout.yaxis },
  };
}

interface PlotlyChartProps extends Figure {
  /** Chart height in px; Plotly needs an explicit height to lay out. */
  height?: number;
  /** Accessible description of what the chart shows. */
  label: string;
}

export function PlotlyChart({ data, layout, height = 300, label }: PlotlyChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useChartTheme();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;

    loadPlotly()
      .then((Plotly) => {
        if (cancelled) return;
        return Plotly.react(
          element,
          data as Data[],
          mergeLayout(baseLayout(theme), layout),
          CONFIG
        );
      })
      .catch((error: unknown) => {
        if (import.meta.env.DEV) console.error('[PlotlyChart]', error);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [data, layout, theme]);

  // Grid columns change width without a window resize; follow the container.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const resize =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => {
            void loadPlotly().then((Plotly) => {
              if (element.isConnected && element.querySelector('.main-svg')) {
                void Plotly.Plots.resize(element);
              }
            });
          });
    resize?.observe(element);

    return () => {
      resize?.disconnect();
      void loadPlotly()
        .then((Plotly) => Plotly.purge(element))
        .catch(() => {});
    };
  }, []);

  if (failed) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-muted text-300 text-muted-foreground"
        style={{ height }}
      >
        The chart could not be displayed.
      </div>
    );
  }

  return <div ref={ref} role="img" aria-label={label} className="w-full" style={{ height }} />;
}

# Fabric App Template

Ready-to-copy files for building a **Fabric App** (dashboard) without coding from scratch.
Every component is taken from **datacubeapp** — an app already running in Microsoft
Fabric — and cleaned up so it can be reused: header, scrolling layout, chart cards,
10 visual types, and a blue theme with dark mode.

**Who it's for:** data people who want to build a Fabric App dashboard and keep full
control over their data — writing the queries themselves, or asking AI for help.

## What's in the repo

```
fabric-app-template/
├─ README.md                 ← this file
├─ GUIDE_OUTLINE.md          ← outline for a learning module
├─ PROMPTS_FOR_CLAUDE.md     ← ready-to-use prompts for Claude Code
└─ template/
   ├─ src/                   ← COPY its contents into packages/frontend/src/ in your project
   │  ├─ data/data.ts        ← 👉 the only place where data is configured
   │  ├─ data/sample-data.ts ← sample (dummy) data
   │  ├─ dashboard/Dashboard.tsx ← the page: title, menu, chart cards
   │  ├─ components/charts/  ← 10 chart components (1 file = 1 chart)
   │  ├─ components/         ← chart card, Plotly wrapper, section
   │  ├─ lib/ hooks/ types/  ← theme, number formatting, loading state (no changes needed)
   │  ├─ global.css          ← color & spacing tokens (replaces the default global.css)
   │  └─ App.tsx, App.spec.tsx, Root.spec.tsx ← replacements for the default files
   └─ examples/warehouse/    ← complete example of reading data from a Fabric warehouse
```

The structure of `template/src/` deliberately mirrors `packages/frontend/src/` in a
Rayfin project, so you can copy it folder to folder.

## Quickstart

> You need a Rayfin project created from the **blankapp** (Universal App) template — the
> same base template as datacubeapp. Full steps are in `GUIDE_OUTLINE.md`.

```bash
# 1. Create the project (choose the blankapp template)
npm create @microsoft/rayfin@latest my-app -- --template blankapp
cd my-app

# 2. Install Plotly (the chart library used by datacubeapp)
npm install plotly.js-dist-min@^4.1.1 -w @rayfin-app/frontend
npm install -D @types/plotly.js@^3.0.14 -w @rayfin-app/frontend
```

3. **Copy** everything in `template/src/` into `packages/frontend/src/` in your project.
   Overwrite the existing files: `App.tsx`, `App.spec.tsx`, `Root.spec.tsx`, `global.css`.
4. Open `src/dashboard/Dashboard.tsx` → change the title & menu in the **CONFIGURATION** section.
5. Open `src/data/data.ts` → replace the data (see the next section).
6. Check before deploying:

```bash
npm run typecheck && npm test && npm run build
```

Look for the **`👉 CHANGE HERE`** marker in each file — those are the parts you need to edit.
Leave files marked **`✅ NO CHANGES NEEDED`** as they are.

## Configuring data

Chart components don't fetch data themselves — all data comes from
`src/data/data.ts`. There are two options, the same ones datacubeapp uses:

| Option | When to use | Where |
|---|---|---|
| **A. Sample data** | Trying out the layout first | `src/data/sample-data.ts` |
| **B. Fabric warehouse** | Real data | Summary-table SQL → entity connector → `data.ts` (`examples/warehouse/`) |

While sample data is still in use, the dashboard shows a **Sample data** label so it
isn't mistaken for real figures. Once everything has moved to Option B, set `USING_SAMPLE_DATA = false`.

Each chart component documents the **data shape** it needs at the top of its file.
Map your query results to that shape.

## Chart components

| Component | Used for | Origin in datacubeapp |
|---|---|---|
| `KpiCard` | headline number + ▲▼ vs last year | KPI row |
| `LineChart` | trend over time, one or more lines | Monthly Revenue Trend, Gross Margin % Trend |
| `BarChart` | horizontal Top-N, or vertical side-by-side | Revenue by City, Top 10 Customers, Actual vs Target |
| `DonutChart` | share of a total | Table Migration Status |
| `GaugeChart` | % achievement against 100% | Target Achievement |
| `FunnelChart` | count per stage | Funnel Conversion |
| `SankeyChart` | flow from source → target | Funnel Flow, Lineage |
| `WaterfallChart` | start → increases/decreases → total | Gross Profit Waterfall |
| `TreemapChart` | size + color per category | Gross Profit by Care Area |
| `SimpleTable` | list of rows to read through | Needs Attention |

Rupiah amounts are passed **raw** (e.g. `793923438241`) with `unit="IDR"`; the chart
automatically displays them as `Rp 793.9B` (B = billion).

## Adding a chart

**An existing chart type:** copy one `<ChartCard>` block in `Dashboard.tsx`, change
its title, add a `load...()` function in `data.ts`, then wire it up with `useAsync`.

**A new chart type:** create a new file in `components/charts/` modelled on
`DonutChart.tsx` (the simplest one): accept data through props, build the Plotly
object inside `useMemo`, draw it with `<PlotlyChart>`, and take colors from
`useChartTheme()`. List of Plotly trace types: <https://plotly.com/javascript/>.
Or use the "Add a chart" prompt in `PROMPTS_FOR_CLAUDE.md`.

## Future work (not yet in datacubeapp)

Not included yet because they haven't been proven in datacubeapp:

- Map by city/province
- Interactive filters (pick a period/company) that update every chart
- Data from the **app's entity database** (`client.data.<Entity>`) for data that
  users write through the app, rather than from the warehouse
- Dynamic queries through a server-side **function** (`ctx.Tokens.Sql`)
- A **Fabric Data Agent** chatbot inside the app (datacubeapp already has one; extracting
  it into the template is coming later)

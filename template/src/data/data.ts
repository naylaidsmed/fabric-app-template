// =============================================================================
// 🗂️  data.ts — the ONLY place where the dashboard's data is defined.
//
// Chart components don't fetch data themselves; they only draw what is
// passed from here. So you can change this file freely without touching the charts.
//
// Each dataset has one `load...()` function. There are 2 ways to fill it:
//
//   OPTION A — Sample (dummy) data
//     Lives in sample-data.ts. Good for trying out the layout first.
//     While USING_SAMPLE_DATA = true, the dashboard shows a "Sample data" label.
//
//   OPTION B — Fabric warehouse through a connector (the way datacubeapp does it)
//     1. Write your SQL in the warehouse as a small summary TABLE (not a view —
//        the connector can't read views). Example: examples/warehouse/01_summary_table.sql
//     2. Register that table as a connector entity.
//        Example: examples/warehouse/02_RevenueMonthly.ts and 03_schema.ts
//     3. In the `load...()` function, delete the `return sample...;` line and enable
//        the "OPTION B" block below it (remove the // ). Once every function
//        has moved to Option B, set USING_SAMPLE_DATA = false.
//
//   Why are summaries computed in SQL, not here? So the numbers can be audited
//   in one place, the app is fast (it only reads a few dozen rows), and nothing is
//   cut off by the connector's 100-rows-per-page limit.
//
// You can write the queries/entities yourself, OR ask AI for help with the prompts
// in PROMPTS_FOR_CLAUDE.md. Both are supported.
// =============================================================================

// For OPTION B, enable these imports (remove the // ):
// import { getRayfinClient } from '@/lib/rayfin-client';
// import { toDate, toNumber } from '@/lib/format';

import type { KpiUnit } from '@/components/charts/KpiCard';
import type { WaterfallStep } from '@/components/charts/WaterfallChart';

// OPTION A — sample data lives in sample-data.ts. Once every function uses
// Option B, delete this import line (TypeScript will flag it as unused).
import * as sample from './sample-data';

// 👉 CHANGE HERE: set to false once every load...() function uses real data.
export const USING_SAMPLE_DATA = true;

// -----------------------------------------------------------------------------
// Data shape of each dataset. The fields here = the fields the charts use.
// Map your query results to these shapes.
// -----------------------------------------------------------------------------

/** KpiCard: one row per card. value/prevValue may be null. */
export interface KpiRow {
  key: string;
  label: string;
  value: number | null;
  prevValue: number | null;
  unit: KpiUnit;
}

/** Monthly LineChart / BarChart: one row per month, sorted oldest → newest. Raw Rupiah. */
export interface MonthRow {
  month: Date;
  revenue: number;
  cogs: number;
  target: number;
  /** Percent, already multiplied by 100. */
  grossMarginPct: number;
}

/** Top-N BarChart: one row per category, sorted largest first. Raw Rupiah. */
export interface RankedRow {
  name: string;
  revenue: number;
}

/** Actual vs target BarChart: one row per branch. Raw Rupiah. */
export interface BranchRow {
  branch: string;
  revenue: number;
  target: number;
}

/** FunnelChart: one row per stage, starting from the first stage. */
export interface FunnelStageRow {
  stage: string;
  count: number;
}

/** SankeyChart: one row per source → target flow. */
export interface FlowRow {
  from: string;
  to: string;
  amount: number;
}

/** TreemapChart: one row per tile. */
export interface AreaRow {
  area: string;
  grossProfit: number;
  /** Percent, already multiplied by 100. Determines the color. */
  marginPct: number;
}

/** DonutChart: one row per slice, already summed. */
export interface StatusRow {
  status: string;
  tables: number;
}

/** SimpleTable: any columns. */
export interface AttentionRow {
  table: string;
  rows: number;
  status: string;
}

// -----------------------------------------------------------------------------
// Data loader functions. 👉 CHANGE HERE: fill each function using Option A or B.
// -----------------------------------------------------------------------------

export async function loadKpis(): Promise<KpiRow[]> {
  return sample.kpis;

  // OPTION B — from a summary table, e.g. app.KpiSummary (datacubeapp pattern):
  // const client = await getRayfinClient();
  // const rows = await client.connectors.<connectorName>.KpiSummary.findMany();
  // return [...rows]
  //   .sort((a, b) => toNumber(a.sortOrder) - toNumber(b.sortOrder))
  //   .map((row) => ({
  //     key: row.metricKey,
  //     label: row.label,
  //     value: row.value == null ? null : toNumber(row.value),
  //     prevValue: row.prevValue == null ? null : toNumber(row.prevValue),
  //     unit: row.unit as KpiUnit,
  //   }));
}

export async function loadMonthly(): Promise<MonthRow[]> {
  return sample.monthly;

  // OPTION B — COMPLETE example, matching examples/warehouse/:
  // const client = await getRayfinClient();
  // const rows = await client.connectors.<connectorName>.RevenueMonthly.findMany();
  // return rows
  //   .map((row) => {
  //     const revenue = toNumber(row.revenue);
  //     const cogs = toNumber(row.cogs);
  //     return {
  //       // The connector may send dates as text and decimals as text;
  //       // toDate/toNumber normalize them so charts always get a Date/number.
  //       month: toDate(row.monthStart),
  //       revenue,
  //       cogs,
  //       target: toNumber(row.target),
  //       grossMarginPct: revenue === 0 ? 0 : ((revenue - cogs) / revenue) * 100,
  //     };
  //   })
  //   .sort((a, b) => a.month.getTime() - b.month.getTime());
}

export async function loadTopCustomers(): Promise<RankedRow[]> {
  return sample.topCustomers;

  // OPTION B — e.g. app.TopCustomer:
  // const client = await getRayfinClient();
  // const rows = await client.connectors.<connectorName>.TopCustomer.findMany();
  // return rows
  //   .map((row) => ({ name: row.customerName, revenue: toNumber(row.revenue), rank: toNumber(row.customerRank) }))
  //   .sort((a, b) => a.rank - b.rank);
}

export async function loadBranches(): Promise<BranchRow[]> {
  return sample.branches;

  // OPTION B — e.g. app.BranchPerformance:
  // const client = await getRayfinClient();
  // const rows = await client.connectors.<connectorName>.BranchPerformance.findMany();
  // return rows
  //   .map((row) => ({ branch: row.branch, revenue: toNumber(row.revenue), target: toNumber(row.target) }))
  //   .sort((a, b) => b.revenue - a.revenue);
}

export async function loadFunnelStages(): Promise<FunnelStageRow[]> {
  return sample.funnelStages;
}

export async function loadFunnelFlows(): Promise<FlowRow[]> {
  return sample.funnelFlows;
}

export async function loadCareAreas(): Promise<AreaRow[]> {
  return sample.careAreas;
}

/** The waterfall is computed from total revenue & COGS. Change loadMonthly() and this follows. */
export async function loadProfitSteps(): Promise<WaterfallStep[]> {
  const months = await loadMonthly();
  const revenue = months.reduce((sum, m) => sum + m.revenue, 0);
  const cogs = months.reduce((sum, m) => sum + m.cogs, 0);
  return [
    { label: 'Revenue', value: revenue, measure: 'absolute' },
    { label: 'COGS', value: -cogs, measure: 'relative' },
    { label: 'Gross Profit', value: 0, measure: 'total' },
  ];
}

export async function loadMigrationStatus(): Promise<StatusRow[]> {
  return sample.migrationStatus;
}

export async function loadAttention(): Promise<AttentionRow[]> {
  return sample.attention;
}

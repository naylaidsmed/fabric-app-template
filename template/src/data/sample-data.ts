// =============================================================================
// 🧪 sample-data.ts — OPTION A: sample (dummy) data. Fictional numbers, only for
// previewing the layout. Used by data.ts through `sample.<name>`.
//
// 👉 CHANGE HERE if you want to try the layout with your own numbers.
// Once every function in data.ts uses real data (Option B), this file and the
// `import * as sample` line in data.ts can be deleted.
// =============================================================================

import type {
  AreaRow,
  AttentionRow,
  BranchRow,
  FlowRow,
  FunnelStageRow,
  KpiRow,
  MonthRow,
  RankedRow,
  StatusRow,
} from './data';

const B = 1e9; // 1 billion Rupiah, so the sample numbers are easy to read

export const kpis: KpiRow[] = [
  { key: 'revenue', label: 'Total Revenue (YTD)', value: 812.4 * B, prevValue: 735.1 * B, unit: 'IDR' },
  { key: 'customers', label: 'Active Customers (YTD)', value: 1284, prevValue: 1310, unit: 'count' },
  { key: 'products', label: 'Products Sold (YTD)', value: 3412, prevValue: 3196, unit: 'count' },
  { key: 'target', label: 'Target Achievement (YTD)', value: 87.4, prevValue: 82.1, unit: 'pct' },
  { key: 'winrate', label: 'Funnel Win Rate (YTD)', value: 41.8, prevValue: 44.0, unit: 'pct' },
];

export const monthly: MonthRow[] = [
  [62, 39, 70],
  [71, 44, 72],
  [88, 53, 85],
  [79, 49, 80],
  [94, 58, 92],
  [101, 63, 98],
  [86, 54, 95],
  [97, 61, 100],
  [109, 67, 105],
  [92, 57, 102],
  [104, 65, 108],
  [118, 72, 115],
].map(([revenue, cogs, target], i) => ({
  month: new Date(Date.UTC(2025, 9 + i, 1)),
  revenue: revenue * B,
  cogs: cogs * B,
  target: target * B,
  grossMarginPct: ((revenue - cogs) / revenue) * 100,
}));

export const topCustomers: RankedRow[] = [
  { name: 'Sample General Hospital', revenue: 48.2 * B },
  { name: 'Healthy Together Clinic', revenue: 36.9 * B },
  { name: 'City Hope Hospital', revenue: 31.4 * B },
  { name: 'Prime Medika Laboratory', revenue: 27.8 * B },
  { name: 'Rose Mother & Child Hospital', revenue: 22.5 * B },
];

export const branches: BranchRow[] = [
  { branch: 'JAKARTA', revenue: 320.5 * B, target: 350 * B },
  { branch: 'SURABAYA', revenue: 168.2 * B, target: 175 * B },
  { branch: 'BANDUNG', revenue: 121.7 * B, target: 110 * B },
  { branch: 'MEDAN', revenue: 98.4 * B, target: 120 * B },
  { branch: 'MAKASSAR', revenue: 61.3 * B, target: 70 * B },
];

export const funnelStages: FunnelStageRow[] = [
  { stage: 'Funnels created', count: 640 },
  { stage: 'Decided (Won + Lost)', count: 372 },
  { stage: 'Won', count: 156 },
];

export const funnelFlows: FlowRow[] = [
  { from: 'Funnels created', to: 'In progress', amount: 210 * B },
  { from: 'Funnels created', to: 'Won', amount: 184 * B },
  { from: 'Funnels created', to: 'Lost', amount: 131 * B },
  { from: 'Funnels created', to: 'Cancelled', amount: 42 * B },
];

export const careAreas: AreaRow[] = [
  { area: 'Cardiology', grossProfit: 96 * B, marginPct: 41 },
  { area: 'Radiology', grossProfit: 74 * B, marginPct: 33 },
  { area: 'Laboratory', grossProfit: 58 * B, marginPct: 46 },
  { area: 'Surgical', grossProfit: 39 * B, marginPct: 28 },
  { area: 'Critical Care', grossProfit: 27 * B, marginPct: 37 },
];

export const migrationStatus: StatusRow[] = [
  { status: 'Loaded', tables: 70 },
  { status: 'Empty', tables: 1 },
];

export const attention: AttentionRow[] = [{ table: 'dbo.SampleTable', rows: 0, status: 'Empty' }];

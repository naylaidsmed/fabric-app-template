// =============================================================================
// 🖥️  Dashboard.tsx — halaman utama (header + hero + bagian-bagian yang di-scroll).
// Diambil dari datacubeapp (dashboard/dashboard.tsx + section executive/sales/...).
//
// Cara pakai:
//   1. 👉 GANTI DI SINI: judul, deskripsi, dan menu di bagian KONFIGURASI.
//   2. Data diambil dari src/data/data.ts — ubah data di sana, bukan di sini.
//   3. Hapus kartu chart yang tidak perlu, atau salin satu <ChartCard> untuk
//      menambah chart baru (lihat README: "Menambah chart").
//
// Pola tiap kartu:
//   <ChartCard title=... subtitle=...>
//     <DataState resource={...}>        ← loading / error / kosong ditangani di sini
//       {(rows) => <SomeChart data={rows} ... />}
//     </DataState>
//   </ChartCard>
// =============================================================================

import { Moon, Sun } from 'lucide-react';

import { ChartCard, DataState } from '@/components/chart-card';
import { BarChart, type BarSeries } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { KpiCard } from '@/components/charts/KpiCard';
import { LineChart, type LineSeries } from '@/components/charts/LineChart';
import { SankeyChart } from '@/components/charts/SankeyChart';
import { SimpleTable, type TableColumn } from '@/components/charts/SimpleTable';
import { TreemapChart } from '@/components/charts/TreemapChart';
import { WaterfallChart } from '@/components/charts/WaterfallChart';
import { Section } from '@/components/section';
import {
  USING_SAMPLE_DATA,
  loadAttention,
  loadBranches,
  loadCareAreas,
  loadFunnelFlows,
  loadFunnelStages,
  loadKpis,
  loadMigrationStatus,
  loadMonthly,
  loadProfitSteps,
  loadTopCustomers,
  type AttentionRow,
  type BranchRow,
  type MonthRow,
  type RankedRow,
} from '@/data/data';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/theme.context';
import { formatCount, formatPct } from '@/lib/format';

// -----------------------------------------------------------------------------
// KONFIGURASI — 👉 GANTI DI SINI
// -----------------------------------------------------------------------------

export const APP_TITLE = 'My Fabric App';
const APP_DESCRIPTION =
  'A short sentence on what this dashboard answers and for whom. Amounts in Indonesian Rupiah (IDR).';
/** Teks kecil di bawah judul, mis. periode data. */
const DATA_NOTE = 'Data through Sep 24, 2026 · YTD from Jan 1, 2026';
/** Logo di header (taruh file di packages/frontend/public/). Kosongkan = tanpa logo. */
const LOGO_SRC = '';

/** Menu = daftar bagian. `href` harus sama dengan `id` di <Section>. */
const NAV = [
  { href: '#overview', label: 'Overview' },
  { href: '#sales', label: 'Sales' },
  { href: '#finance', label: 'Finance & Data' },
];

// Konfigurasi seri chart ditaruh di luar komponen supaya tidak dibuat ulang
// setiap render (chart tidak perlu digambar ulang tanpa alasan).
const TREND_LINES: LineSeries<MonthRow>[] = [
  { key: 'revenue', name: 'Revenue', area: true },
  { key: 'target', name: 'Target', dashed: true },
];
const MARGIN_LINE: LineSeries<MonthRow>[] = [
  { key: 'grossMarginPct', name: 'Gross margin', markers: true },
];
const REVENUE_BAR: BarSeries<RankedRow>[] = [{ key: 'revenue', name: 'Revenue', color: 'navy' }];
const BRANCH_REVENUE_BAR: BarSeries<BranchRow>[] = [{ key: 'revenue', name: 'Revenue' }];
const ACTUAL_VS_TARGET: BarSeries<BranchRow>[] = [
  { key: 'revenue', name: 'Actual' },
  { key: 'target', name: 'Target' },
];
const ATTENTION_COLUMNS: TableColumn<AttentionRow>[] = [
  { key: 'table', header: 'Table' },
  { key: 'rows', header: 'Rows', align: 'right', format: (value) => formatCount(Number(value)) },
  { key: 'status', header: 'Status' },
];

// -----------------------------------------------------------------------------
// Header & hero — biasanya tidak perlu diubah selain konfigurasi di atas.
// -----------------------------------------------------------------------------

function Header() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-40 bg-navy/95 text-navy-foreground shadow-card backdrop-blur">
      <nav
        aria-label="Dashboard sections"
        className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-200 px-500 py-300"
      >
        <a href="#top" className="mr-auto flex items-center gap-300 font-bold tracking-wide">
          {LOGO_SRC ? <img src={LOGO_SRC} alt="" className="h-10 w-auto object-contain" /> : null}
          <span>{APP_TITLE}</span>
        </a>
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-lg px-300 py-200 text-300 text-navy-muted hover:bg-white/10 hover:text-navy-foreground focus-visible:outline-2 focus-visible:outline-navy-foreground"
          >
            {item.label}
          </a>
        ))}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="ml-100 rounded-lg p-200 text-navy-muted hover:bg-white/10 hover:text-navy-foreground focus-visible:outline-2 focus-visible:outline-navy-foreground"
        >
          {isDark ? <Sun className="icon-size-200" aria-hidden /> : <Moon className="icon-size-200" aria-hidden />}
        </button>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <div id="top" className="bg-linear-135 from-navy via-navy-2 to-navy-3 px-500 pt-800 pb-[72px] text-navy-foreground">
      <div className="mx-auto max-w-[1180px]">
        <h1 className="mb-200 font-heading text-hero-800 font-bold leading-hero-800">{APP_TITLE}</h1>
        <p className="mb-300 max-w-[640px] text-400 leading-400 text-navy-muted">{APP_DESCRIPTION}</p>
        <p className="text-300 text-navy-muted">
          {DATA_NOTE}
          {USING_SAMPLE_DATA ? (
            // Wajib terlihat selama data masih contoh, supaya tidak dikira angka asli.
            <span className="ml-200 rounded-full bg-warn-soft px-200 py-100-nudge text-200 font-bold text-warn">
              Sample data
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Halaman — tiap useAsync memuat satu dataset dari data.ts, paralel.
// Satu dataset gagal tidak mengosongkan kartu lain.
// -----------------------------------------------------------------------------

export function Dashboard() {
  const kpis = useAsync(loadKpis);
  const monthly = useAsync(loadMonthly);
  const customers = useAsync(loadTopCustomers);
  const branches = useAsync(loadBranches);
  const funnelStages = useAsync(loadFunnelStages);
  const funnelFlows = useAsync(loadFunnelFlows);
  const careAreas = useAsync(loadCareAreas);
  const profitSteps = useAsync(loadProfitSteps);
  const migration = useAsync(loadMigrationStatus);
  const attention = useAsync(loadAttention);

  const targetPct =
    kpis.state.status === 'ready'
      ? kpis.state.data.find((k) => k.unit === 'pct' && k.key === 'target')?.value ?? null
      : null;

  return (
    <div className="min-h-full bg-background">
      <Header />
      <Hero />
      <main className="mx-auto max-w-[1180px] px-500 pb-[96px]">
        {/* Baris KPI menumpang sedikit di atas hero, seperti datacubeapp. */}
        <div className="relative z-10 -mt-800">
          <DataState resource={kpis} height={112} isEmpty={(rows) => rows.length === 0}>
            {(rows) => (
              <div className="grid grid-cols-2 gap-400 md:grid-cols-3 xl:grid-cols-5">
                {rows.map((kpi) => (
                  <KpiCard key={kpi.key} label={kpi.label} value={kpi.value} prevValue={kpi.prevValue} unit={kpi.unit} />
                ))}
              </div>
            )}
          </DataState>
        </div>

        <Section id="overview" title="Overview" subtitle="the year to date at a glance">
          <div className="grid gap-400 lg:grid-cols-3">
            <ChartCard className="lg:col-span-2" title="Monthly Revenue Trend" subtitle="revenue vs target (IDR billions)">
              <DataState resource={monthly} isEmpty={(rows) => rows.length === 0}>
                {(rows) => (
                  <LineChart data={rows} x="month" lines={TREND_LINES} unit="IDR" label="Monthly revenue and target trend, IDR billions" />
                )}
              </DataState>
            </ChartCard>
            <ChartCard title="Target Achievement" subtitle="YTD revenue vs target">
              <DataState resource={kpis} isEmpty={() => targetPct == null}>
                {() => <GaugeChart value={targetPct ?? 0} label={`Year-to-date target achievement ${formatPct(targetPct ?? 0)}`} />}
              </DataState>
            </ChartCard>
            <ChartCard className="lg:col-span-3" title="Revenue by City" subtitle="sales branch, year to date (IDR billions)">
              <DataState resource={branches} isEmpty={(rows) => rows.length === 0}>
                {(rows) => (
                  <BarChart data={rows} category="branch" bars={BRANCH_REVENUE_BAR} unit="IDR" topN={8} label="Year-to-date revenue by city, IDR billions" />
                )}
              </DataState>
            </ChartCard>
          </div>
        </Section>

        <Section id="sales" title="Sales" subtitle="sales and funnel performance">
          <div className="grid gap-400 lg:grid-cols-2">
            <ChartCard title="Funnel Flow" subtitle="funnel value by current status (IDR billions)">
              <DataState resource={funnelFlows} isEmpty={(rows) => rows.length === 0}>
                {(rows) => (
                  <SankeyChart
                    data={rows}
                    sourceKey="from"
                    targetKey="to"
                    valueKey="amount"
                    unit="IDR"
                    nodeColors={{ Won: 'good', Lost: 'bad', 'In progress': 'warn', Cancelled: 'muted' }}
                    label="Sankey of funnel value by status"
                  />
                )}
              </DataState>
            </ChartCard>
            <ChartCard title="Funnel Conversion" subtitle="funnels per stage">
              <DataState resource={funnelStages} isEmpty={(rows) => rows.length === 0}>
                {(rows) => (
                  <FunnelChart data={rows} stageKey="stage" valueKey="count" unitName="funnels" label="Funnel conversion: created, decided, won" />
                )}
              </DataState>
            </ChartCard>
            <ChartCard title="Top Customers" subtitle="by YTD revenue (IDR billions)">
              <DataState resource={customers} height={360} isEmpty={(rows) => rows.length === 0}>
                {(rows) => (
                  <BarChart data={rows} category="name" bars={REVENUE_BAR} unit="IDR" topN={10} height={360} labelWidth={170} label="Customers with the highest year-to-date revenue, IDR billions" />
                )}
              </DataState>
            </ChartCard>
            <ChartCard title="Actual vs Target by Branch" subtitle="year to date (IDR billions)">
              <DataState resource={branches} height={360} isEmpty={(rows) => rows.length === 0}>
                {(rows) => (
                  <BarChart data={rows} category="branch" bars={ACTUAL_VS_TARGET} orientation="v" unit="IDR" height={360} label="Actual revenue vs target by branch, IDR billions" />
                )}
              </DataState>
            </ChartCard>
          </div>
        </Section>

        <Section id="finance" title="Finance & Data" subtitle="profitability and data health">
          <div className="grid gap-400 lg:grid-cols-2">
            <ChartCard title="Gross Profit Waterfall" subtitle="Revenue → COGS → Gross Profit (IDR billions)">
              <DataState resource={profitSteps} height={320} isEmpty={(steps) => steps.length === 0}>
                {(steps) => <WaterfallChart steps={steps} unit="IDR" label="Waterfall of revenue, COGS and gross profit" />}
              </DataState>
            </ChartCard>
            <ChartCard title="Gross Profit by Care Area" subtitle="size = gross profit, color = margin %">
              <DataState resource={careAreas} height={320} isEmpty={(rows) => rows.length === 0}>
                {(rows) => (
                  <TreemapChart data={rows} labelKey="area" valueKey="grossProfit" colorKey="marginPct" colorName="Margin" unit="IDR" label="Treemap of gross profit by care area; darker means higher margin" />
                )}
              </DataState>
            </ChartCard>
            <ChartCard title="Gross Margin % Trend" subtitle="(revenue − COGS) ÷ revenue">
              <DataState resource={monthly} isEmpty={(rows) => rows.length === 0}>
                {(rows) => <LineChart data={rows} x="month" lines={MARGIN_LINE} unit="pct" label="Monthly gross margin percentage" />}
              </DataState>
            </ChartCard>
            <ChartCard title="Table Migration Status" subtitle="migrated tables by load status">
              <DataState resource={migration} isEmpty={(rows) => rows.length === 0}>
                {(rows) => (
                  <DonutChart data={rows} labelKey="status" valueKey="tables" unitName="tables" colors={{ Loaded: 'good', Empty: 'bad' }} label="Donut of table migration status" />
                )}
              </DataState>
            </ChartCard>
            <ChartCard className="lg:col-span-2" title="Needs Attention" subtitle="tables that are empty or did not load cleanly">
              <DataState resource={attention}>
                {(rows) => <SimpleTable data={rows} columns={ATTENTION_COLUMNS} emptyText="All tables are loaded and contain data." />}
              </DataState>
            </ChartCard>
          </div>
        </Section>

        <footer className="pt-800 text-center text-200 text-muted-foreground">
          {/* 👉 GANTI DI SINI: sebutkan sumber data, supaya pembaca tahu angkanya dari mana. */}
          Source: {USING_SAMPLE_DATA ? 'sample data (not real figures)' : 'your Fabric warehouse'}
        </footer>
      </main>
    </div>
  );
}

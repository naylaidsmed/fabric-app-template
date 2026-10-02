// =============================================================================
// 🗂️  data.ts — SATU-SATUNYA tempat menentukan data dashboard.
//
// Komponen chart tidak mengambil data sendiri; mereka hanya menggambar apa yang
// dikirim dari sini. Jadi kamu bebas mengubah file ini tanpa menyentuh chart.
//
// Setiap dataset punya satu fungsi `load...()`. Ada 2 cara mengisinya:
//
//   CARA A — Data contoh (dummy)
//     Ada di sample-data.ts. Cocok untuk mencoba tampilan dulu.
//     Selama USING_SAMPLE_DATA = true, dashboard menampilkan label "Sample data".
//
//   CARA B — Warehouse Fabric lewat connector (cara yang dipakai datacubeapp)
//     1. Tulis SQL-mu di warehouse sebagai TABEL ringkasan kecil (bukan view —
//        connector tidak bisa membaca view). Contoh: examples/warehouse/01_summary_table.sql
//     2. Daftarkan tabel itu sebagai entity connector.
//        Contoh: examples/warehouse/02_RevenueMonthly.ts dan 03_schema.ts
//     3. Di fungsi `load...()`, hapus baris `return sample...;` lalu aktifkan
//        blok "CARA B" di bawahnya (hapus tanda // ). Setelah semua fungsi
//        pindah ke Cara B, set USING_SAMPLE_DATA = false.
//
//   Kenapa ringkasan dihitung di SQL, bukan di sini? Supaya angka bisa diaudit
//   di satu tempat, app cepat (hanya baca puluhan baris), dan tidak terpotong
//   batas 100 baris per halaman dari connector.
//
// Kamu boleh menulis query/entity sendiri, ATAU minta bantuan AI dengan prompt
// di PROMPTS_FOR_CLAUDE.md. Keduanya didukung.
// =============================================================================

// Untuk CARA B, aktifkan import ini (hapus tanda // ):
// import { getRayfinClient } from '@/lib/rayfin-client';
// import { toDate, toNumber } from '@/lib/format';

import type { KpiUnit } from '@/components/charts/KpiCard';
import type { WaterfallStep } from '@/components/charts/WaterfallChart';

// CARA A — data contoh ada di sample-data.ts. Kalau semua fungsi sudah memakai
// Cara B, hapus baris import ini (TypeScript akan menandainya sebagai tidak dipakai).
import * as sample from './sample-data';

// 👉 GANTI DI SINI: set ke false setelah semua fungsi load...() memakai data asli.
export const USING_SAMPLE_DATA = true;

// -----------------------------------------------------------------------------
// Bentuk data tiap dataset. Kolom di sini = kolom yang dipakai chart.
// Petakan hasil query-mu ke bentuk ini.
// -----------------------------------------------------------------------------

/** KpiCard: satu baris per kartu. value/prevValue boleh null. */
export interface KpiRow {
  key: string;
  label: string;
  value: number | null;
  prevValue: number | null;
  unit: KpiUnit;
}

/** LineChart / BarChart per bulan: satu baris per bulan, urut lama → baru. Rupiah mentah. */
export interface MonthRow {
  month: Date;
  revenue: number;
  cogs: number;
  target: number;
  /** Persen, sudah dikali 100. */
  grossMarginPct: number;
}

/** BarChart Top-N: satu baris per kategori, urut dari terbesar. Rupiah mentah. */
export interface RankedRow {
  name: string;
  revenue: number;
}

/** BarChart actual vs target: satu baris per branch. Rupiah mentah. */
export interface BranchRow {
  branch: string;
  revenue: number;
  target: number;
}

/** FunnelChart: satu baris per tahap, urut dari tahap pertama. */
export interface FunnelStageRow {
  stage: string;
  count: number;
}

/** SankeyChart: satu baris per aliran asal → tujuan. */
export interface FlowRow {
  from: string;
  to: string;
  amount: number;
}

/** TreemapChart: satu baris per kotak. */
export interface AreaRow {
  area: string;
  grossProfit: number;
  /** Persen, sudah dikali 100. Menentukan warna. */
  marginPct: number;
}

/** DonutChart: satu baris per irisan, sudah dijumlahkan. */
export interface StatusRow {
  status: string;
  tables: number;
}

/** SimpleTable: kolom bebas. */
export interface AttentionRow {
  table: string;
  rows: number;
  status: string;
}

// -----------------------------------------------------------------------------
// Fungsi pengambil data. 👉 GANTI DI SINI: isi tiap fungsi dengan Cara A atau B.
// -----------------------------------------------------------------------------

export async function loadKpis(): Promise<KpiRow[]> {
  return sample.kpis;

  // CARA B — dari tabel ringkasan, mis. app.KpiSummary (pola datacubeapp):
  // const client = await getRayfinClient();
  // const rows = await client.connectors.<namaConnector>.KpiSummary.findMany();
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

  // CARA B — contoh LENGKAP, cocok dengan examples/warehouse/:
  // const client = await getRayfinClient();
  // const rows = await client.connectors.<namaConnector>.RevenueMonthly.findMany();
  // return rows
  //   .map((row) => {
  //     const revenue = toNumber(row.revenue);
  //     const cogs = toNumber(row.cogs);
  //     return {
  //       // Connector bisa mengirim tanggal sebagai teks dan desimal sebagai teks;
  //       // toDate/toNumber menyeragamkannya supaya chart selalu dapat Date/angka.
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

  // CARA B — mis. app.TopCustomer:
  // const client = await getRayfinClient();
  // const rows = await client.connectors.<namaConnector>.TopCustomer.findMany();
  // return rows
  //   .map((row) => ({ name: row.customerName, revenue: toNumber(row.revenue), rank: toNumber(row.customerRank) }))
  //   .sort((a, b) => a.rank - b.rank);
}

export async function loadBranches(): Promise<BranchRow[]> {
  return sample.branches;

  // CARA B — mis. app.BranchPerformance:
  // const client = await getRayfinClient();
  // const rows = await client.connectors.<namaConnector>.BranchPerformance.findMany();
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

/** Waterfall dihitung dari total revenue & COGS. Ganti loadMonthly(), ini ikut. */
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

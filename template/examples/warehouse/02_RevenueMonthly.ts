// =============================================================================
// CONTOH — entity connector untuk tabel app.RevenueMonthly.
// Pola sama persis dengan datacubeapp (rayfin/connectors/datacubewarehouse/RevenueMonthly.ts).
//
// 👉 Taruh di: rayfin/connectors/<namaConnector>/RevenueMonthly.ts
//
// Satu file = satu tabel. Setiap field memetakan satu kolom SQL:
//   @decimal({ column: 'Revenue', ... }) revenue  → kolom SQL "Revenue" dibaca
//                                                    di app sebagai `row.revenue`
// Tipe decorator mengikuti tipe kolom: date → @date, decimal → @decimal,
// int → @int, varchar → @text({ max: <panjang varchar> }), bit → @boolean.
// Kolom yang boleh NULL diberi { optional: true } dan tanda `?`.
// Cek nama & tipe kolom asli di rayfin/connectors/<namaConnector>/metadata.json
// (dibuat otomatis oleh `rayfin connector add`) — jangan menebak.
//
// @role('authenticated', ['read']) = hanya user yang sudah login, hanya baca.
// =============================================================================

import { entity, date, decimal, role } from '@microsoft/rayfin-core';
import { Source } from '@microsoft/rayfin-connectors';

/** app.RevenueMonthly — revenue, COGS, gross profit dan target per bulan. */
@role('authenticated', ['read'])
@entity()
export class RevenueMonthly extends Source({ schema: 'app', table: 'RevenueMonthly', primaryKey: [] }) {
  @date({ column: 'MonthStart' }) monthStart!: Date;
  @decimal({ column: 'Revenue', precision: 19, scale: 2 }) revenue!: number;
  @decimal({ column: 'Cogs', precision: 19, scale: 2 }) cogs!: number;
  @decimal({ column: 'GrossProfit', precision: 19, scale: 2 }) grossProfit!: number;
  @decimal({ column: 'Target', precision: 19, scale: 2 }) target!: number;
}

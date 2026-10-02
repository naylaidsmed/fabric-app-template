// =============================================================================
// EXAMPLE — connector entity for the app.RevenueMonthly table.
// Exactly the same pattern as datacubeapp (rayfin/connectors/datacubewarehouse/RevenueMonthly.ts).
//
// 👉 Put it in: rayfin/connectors/<connectorName>/RevenueMonthly.ts
//
// One file = one table. Each field maps one SQL column:
//   @decimal({ column: 'Revenue', ... }) revenue  → SQL column "Revenue" is read
//                                                    in the app as `row.revenue`
// The decorator follows the column type: date → @date, decimal → @decimal,
// int → @int, varchar → @text({ max: <varchar length> }), bit → @boolean.
// Nullable columns get { optional: true } and a `?`.
// Check the real column names & types in rayfin/connectors/<connectorName>/metadata.json
// (generated automatically by `rayfin connector add`) — don't guess.
//
// @role('authenticated', ['read']) = signed-in users only, read only.
// =============================================================================

import { entity, date, decimal, role } from '@microsoft/rayfin-core';
import { Source } from '@microsoft/rayfin-connectors';

/** app.RevenueMonthly — revenue, COGS, gross profit and target per month. */
@role('authenticated', ['read'])
@entity()
export class RevenueMonthly extends Source({ schema: 'app', table: 'RevenueMonthly', primaryKey: [] }) {
  @date({ column: 'MonthStart' }) monthStart!: Date;
  @decimal({ column: 'Revenue', precision: 19, scale: 2 }) revenue!: number;
  @decimal({ column: 'Cogs', precision: 19, scale: 2 }) cogs!: number;
  @decimal({ column: 'GrossProfit', precision: 19, scale: 2 }) grossProfit!: number;
  @decimal({ column: 'Target', precision: 19, scale: 2 }) target!: number;
}

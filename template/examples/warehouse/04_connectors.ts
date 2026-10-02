// =============================================================================
// EXAMPLE — wiring the connector into the app (RayfinClient).
// Same pattern as datacubeapp (packages/frontend/src/lib/connectors.ts).
//
// 👉 Put it in: packages/frontend/src/lib/connectors.ts (replace its contents)
//
// After this, in data.ts you can write:
//   const client = await getRayfinClient();
//   client.connectors.warehouse.RevenueMonthly.findMany();
//                     ^^^^^^^^^ = the key below. Must MATCH the connector's
//                               `name` in rayfin/rayfin.yml.
//
// Why write it by hand? The default file contains an "@generated" marker that makes
// `rayfin connector add` rewrite this file every time it runs. Removing that
// marker makes the file yours so it won't be overwritten — the CLI will only
// print the code snippet you need to add.
// =============================================================================

import type { ConnectorConfig, ConnectorsRuntime } from '@microsoft/rayfin-connectors';

import {
  connectorConfig as warehouseConfig,
  type WarehouseSchema,
} from '../../../../rayfin/connectors/warehouse/schema';

export type AppConnectorsSchema = {
  warehouse: WarehouseSchema;
};

export const connectorConfigs: Record<string, ConnectorConfig> = {
  warehouse: warehouseConfig,
};

// The warehouse connector needs no extra runtime.
export const connectorRuntimes: ConnectorsRuntime = {};

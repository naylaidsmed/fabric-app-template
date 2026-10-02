// =============================================================================
// CONTOH — menyambungkan connector ke app (RayfinClient).
// Pola sama dengan datacubeapp (packages/frontend/src/lib/connectors.ts).
//
// 👉 Taruh di: packages/frontend/src/lib/connectors.ts (ganti isinya)
//
// Setelah ini, di data.ts kamu bisa menulis:
//   const client = await getRayfinClient();
//   client.connectors.warehouse.RevenueMonthly.findMany();
//                     ^^^^^^^^^ = kunci di bawah. Harus SAMA dengan `name`
//                               connector di rayfin/rayfin.yml.
//
// Kenapa ditulis manual? File bawaan berisi penanda "@generated" yang membuat
// `rayfin connector add` menulis ulang file ini setiap kali dijalankan. Dengan
// menghapus penanda itu, file ini jadi milikmu dan tidak tertimpa — CLI hanya
// akan mencetak potongan kode yang perlu kamu tambahkan.
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

// Connector warehouse tidak butuh runtime tambahan.
export const connectorRuntimes: ConnectorsRuntime = {};

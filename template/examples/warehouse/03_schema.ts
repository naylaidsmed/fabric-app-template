// =============================================================================
// CONTOH — daftar entity sebuah connector.
// Pola sama persis dengan datacubeapp (rayfin/connectors/datacubewarehouse/schema.ts).
//
// 👉 Taruh di: rayfin/connectors/<namaConnector>/schema.ts
//    (menggantikan schema.ts placeholder buatan `rayfin connector add`)
//
// Menambah tabel baru = 3 baris: import, masukkan ke `entities`, dan ke tipe
// di bawah. Nama di sini = nama yang dipakai di data.ts:
//   client.connectors.<namaConnector>.RevenueMonthly.findMany()
//
// ⚠️ PENTING: setiap entity yang didaftarkan HARUS ada sebagai tabel di
// warehouse. Kalau satu saja tidak ada, warehouse menolak SELURUH connector
// dan semua chart gagal memuat data (bukan hanya chart tabel itu).
// =============================================================================

import type { GraphQLBackedConnector } from '@microsoft/rayfin-connector-fabric-graphql';
import type { ConnectorConfig } from '@microsoft/rayfin-connectors';

import { RevenueMonthly } from './RevenueMonthly.js';

export { RevenueMonthly } from './RevenueMonthly.js';

// Subset: hanya tabel ringkasan yang dibaca dashboard. Connector read-only.
export const connectorConfig = {
  connector: 'fabric-warehouse',
  operations: ['read'],
  entities: {
    RevenueMonthly,
  },
} as const satisfies ConnectorConfig;

// 👉 GANTI DI SINI: nama tipe boleh bebas; dipakai di src/lib/connectors.ts.
export type WarehouseSchema = GraphQLBackedConnector<
  {
    RevenueMonthly: typeof RevenueMonthly;
  },
  typeof connectorConfig
>;

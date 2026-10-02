# Data dari warehouse Fabric (Cara B)

Langkah yang benar-benar dipakai di datacubeapp untuk membaca warehouse.
Contoh di folder ini memakai nama connector **`warehouse`** dan satu tabel
**`app.RevenueMonthly`**. Ganti keduanya sesuai project-mu.

| Langkah | Yang dilakukan | File contoh |
|---|---|---|
| 1 | Pasang capability connector (sekali saja, dari root project): `npm run pack:add -- connectors` | — |
| 2 | Buat tabel ringkasan di warehouse, jalankan di SQL query editor | `01_summary_table.sql` |
| 3 | Cari warehouse-mu: `npx rayfin connector search --all-workspaces --type fabric-warehouse` | — |
| 4 | Daftarkan connector (salin `workspace-id` & `item-id` dari langkah 3): `npx rayfin connector add --type fabric-warehouse --workspace-id <ws> --item-id <item> --name warehouse --operations read` | — |
| 5 | Buat entity per tabel di `rayfin/connectors/warehouse/` | `02_RevenueMonthly.ts` |
| 6 | Ganti `rayfin/connectors/warehouse/schema.ts` | `03_schema.ts` |
| 7 | Ganti `packages/frontend/src/lib/connectors.ts` | `04_connectors.ts` |
| 8 | Di `src/data/data.ts`: hapus `return sample...;`, aktifkan blok CARA B | `data.ts` |
| 9 | Cek lalu deploy: `npm run typecheck` → `npm test` → `npm run build` → `npx rayfin up` | — |

## Hal yang sering bikin gagal (dialami di datacubeapp)

- **Hanya tabel, bukan view.** Connector tidak bisa membaca view. Kalau logikamu
  ada di view, salin hasilnya ke tabel lewat procedure (lihat `01_summary_table.sql`).
- **Satu tabel hilang = semua gagal.** Setiap entity di `schema.ts` harus ada
  di warehouse. Satu yang tidak ada membuat seluruh connector ditolak.
- **Kolom GUID tidak terbaca.** Jangan petakan kolom `uniqueidentifier`; pakai kolom kode teks.
- **Jangan menebak nama kolom.** Lihat `rayfin/connectors/warehouse/metadata.json`
  (dibuat otomatis di langkah 4) untuk nama dan tipe kolom yang sebenarnya.
- **`connector add --yes` menimpa `schema.ts`** dengan placeholder. Saat menjalankan
  ulang, jangan pakai `--yes`, atau kembalikan `schema.ts`-mu dari git setelahnya.
- **`npm run dev` menghapus connector** dari backend yang sudah di-deploy (Rayfin CLI 1.36.0).
  Setelah connector ada, jalankan lokal dengan `npm run dev:frontend`. Kalau
  terlanjur, pulihkan dengan `npx rayfin up`.
- **Batas 100 baris.** `findMany()` mengambil satu halaman. Tabel ringkasan
  sebaiknya kecil; kalau lebih dari 100 baris, pakai
  `.select([...]).first(1000).execute()` seperti `fetchMigration` di datacubeapp.

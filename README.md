# Fabric App Template

Kumpulan file siap-copy untuk membuat **Fabric App** (dashboard) tanpa ngoding dari nol.
Semua komponen diambil dari **datacubeapp** — app yang sudah berjalan di Microsoft
Fabric — lalu dirapikan supaya bisa dipakai ulang: header, layout scroll, kartu chart,
10 jenis visual, dan tema biru dengan mode gelap.

**Untuk siapa:** orang data yang ingin membuat dashboard Fabric App dan memegang
kendali penuh atas datanya — menulis query sendiri, atau minta bantuan AI.

## Isi repo

```
fabric-app-template/
├─ README.md                 ← file ini
├─ GUIDE_OUTLINE.md          ← kerangka modul belajar
├─ PROMPTS_FOR_CLAUDE.md     ← prompt siap pakai untuk Claude Code
└─ template/
   ├─ src/                   ← COPY isinya ke packages/frontend/src/ di project-mu
   │  ├─ data/data.ts        ← 👉 satu-satunya tempat mengatur data
   │  ├─ data/sample-data.ts ← data contoh (dummy)
   │  ├─ dashboard/Dashboard.tsx ← halaman: judul, menu, kartu chart
   │  ├─ components/charts/  ← 10 komponen chart (1 file = 1 chart)
   │  ├─ components/         ← kartu chart, pembungkus Plotly, section
   │  ├─ lib/ hooks/ types/  ← tema, format angka, status loading (tidak perlu diubah)
   │  ├─ global.css          ← token warna & spasi (ganti global.css bawaan)
   │  └─ App.tsx, App.spec.tsx, Root.spec.tsx ← pengganti file bawaan
   └─ examples/warehouse/    ← contoh lengkap ambil data dari warehouse Fabric
```

Struktur `template/src/` sengaja sama dengan `packages/frontend/src/` di project
Rayfin, jadi cukup di-copy folder ke folder.

## Quickstart

> Butuh project Rayfin dari template **blankapp** (Universal App) — template dasar
> yang sama dengan datacubeapp. Langkah lengkap ada di `GUIDE_OUTLINE.md`.

```bash
# 1. Buat project (pilih template blankapp)
npm create @microsoft/rayfin@latest my-app -- --template blankapp
cd my-app

# 2. Pasang Plotly (library chart yang dipakai datacubeapp)
npm install plotly.js-dist-min@^4.1.1 -w @rayfin-app/frontend
npm install -D @types/plotly.js@^3.0.14 -w @rayfin-app/frontend
```

3. **Copy** seluruh isi `template/src/` ke `packages/frontend/src/` di project-mu.
   Timpa (overwrite) file yang sudah ada: `App.tsx`, `App.spec.tsx`, `Root.spec.tsx`, `global.css`.
4. Buka `src/dashboard/Dashboard.tsx` → ganti judul & menu di bagian **KONFIGURASI**.
5. Buka `src/data/data.ts` → ganti datanya (lihat bagian berikut).
6. Cek sebelum deploy:

```bash
npm run typecheck && npm test && npm run build
```

Cari tanda **`👉 GANTI DI SINI`** di setiap file — itu bagian yang perlu kamu ubah.
File bertanda **`✅ TIDAK PERLU DIUBAH`** biarkan saja.

## Mengatur data

Komponen chart tidak mengambil data sendiri — semua data datang dari
`src/data/data.ts`. Ada dua cara, sama dengan yang dipakai datacubeapp:

| Cara | Kapan dipakai | Di mana |
|---|---|---|
| **A. Data contoh** | Mencoba tampilan dulu | `src/data/sample-data.ts` |
| **B. Warehouse Fabric** | Data asli | SQL tabel ringkasan → entity connector → `data.ts` (`examples/warehouse/`) |

Selama masih memakai data contoh, dashboard menampilkan label **Sample data** supaya
tidak dikira angka asli. Setelah semua pindah ke Cara B, set `USING_SAMPLE_DATA = false`.

Setiap komponen chart menuliskan **bentuk data** yang dibutuhkan di bagian atas
file-nya. Petakan hasil query-mu ke bentuk itu.

## Komponen chart

| Komponen | Untuk | Asal di datacubeapp |
|---|---|---|
| `KpiCard` | angka utama + ▲▼ vs tahun lalu | baris KPI |
| `LineChart` | tren waktu, satu/beberapa garis | Monthly Revenue Trend, Gross Margin % Trend |
| `BarChart` | Top-N horizontal, atau vertikal berdampingan | Revenue by City, Top 10 Customers, Actual vs Target |
| `DonutChart` | porsi dari total | Table Migration Status |
| `GaugeChart` | % pencapaian terhadap 100% | Target Achievement |
| `FunnelChart` | jumlah per tahap | Funnel Conversion |
| `SankeyChart` | aliran asal → tujuan | Funnel Flow, Lineage |
| `WaterfallChart` | awal → penambah/pengurang → total | Gross Profit Waterfall |
| `TreemapChart` | ukuran + warna per kategori | Gross Profit by Care Area |
| `SimpleTable` | daftar baris yang perlu dibaca | Needs Attention |

Angka Rupiah dikirim **mentah** (mis. `793923438241`) dengan `unit="IDR"`; chart
otomatis menampilkannya sebagai `Rp 793.9B` (B = billion = miliar).

## Menambah chart

**Chart yang sudah ada:** salin satu blok `<ChartCard>` di `Dashboard.tsx`, ganti
judulnya, tambah fungsi `load...()` di `data.ts`, lalu sambungkan lewat `useAsync`.

**Jenis chart baru:** buat file baru di `components/charts/` dengan meniru
`DonutChart.tsx` (yang paling sederhana): terima data lewat props, susun objek
Plotly di dalam `useMemo`, gambar dengan `<PlotlyChart>`, ambil warna dari
`useChartTheme()`. Daftar jenis trace Plotly: <https://plotly.com/javascript/>.
Atau pakai prompt "Tambahkan chart" di `PROMPTS_FOR_CLAUDE.md`.

## Pengembangan lanjutan (belum ada di datacubeapp)

Belum dimasukkan karena belum terbukti berjalan di datacubeapp:

- Peta (map) per kota/provinsi
- Filter interaktif (pilih periode/company) yang mengubah semua chart
- Data dari **entity database app** (`client.data.<Entity>`) untuk data yang
  ditulis user lewat app, bukan dari warehouse
- Query dinamis lewat **function** server-side (`ctx.Tokens.Sql`)
- Chatbot **Fabric Data Agent** di dalam app (datacubeapp sudah punya; ekstraksinya
  ke template menyusul)

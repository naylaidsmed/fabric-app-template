# Prompt siap pakai untuk Claude Code

Salin prompt, ganti bagian `[...]`, lalu tempel ke Claude Code yang dibuka di
folder project-mu. Claude akan membaca `AGENTS.md` project dan mengikuti pola
template ini.

> Tip: sebut nama file/chart persis seperti di project (mis. `Dashboard.tsx`,
> `BarChart`, `loadMonthly`) supaya Claude tidak menebak.

---

### 1. Menambah chart
**Kapan:** kamu ingin visual baru di dashboard dari data yang sudah ada.

```
Tambahkan chart [jenis: LineChart/BarChart/DonutChart/...] ke Dashboard.tsx di bagian [nama section],
judul "[judul]", menampilkan [metrik] per [dimensi].
Ambil data dari fungsi baru load[Nama]() di src/data/data.ts (pakai data contoh dulu di sample-data.ts).
Ikuti pola <ChartCard> + <DataState> yang sudah ada, dan bentuk data yang tertulis di atas file komponen chart-nya.
```

### 2. Mengganti data contoh dengan data warehouse
**Kapan:** tampilan sudah oke, sekarang mau pakai angka asli.

```
Ganti fungsi [load...] di src/data/data.ts supaya membaca tabel [schema.Tabel] di warehouse lewat connector [nama connector],
kolom [kolom1, kolom2, ...]. Ikuti blok CARA B dan contoh di template/examples/warehouse.
Cek nama & tipe kolom di rayfin/connectors/[nama connector]/metadata.json — jangan menebak.
```

### 3. Menyambungkan SQL milikku sendiri
**Kapan:** kamu sudah punya query SQL dan ingin hasilnya tampil di chart.

```
Aku punya query ini untuk chart [nama chart]:
[paste SQL]
Jadikan tabel ringkasan di warehouse (schema app, pola DELETE + INSERT di dalam procedure seperti
template/examples/warehouse/01_summary_table.sql), buat entity connector-nya, daftarkan di schema.ts,
dan sambungkan ke fungsi load...() di data.ts. Jangan pakai view — connector hanya bisa membaca tabel.
```

### 4. Membantu menulis query
**Kapan:** kamu tahu angka yang dimau, tapi belum tahu query-nya.

```
Bantu aku menulis query SQL untuk [metrik, mis. revenue per bulan] per [dimensi, mis. branch]
dari tabel [schema.Tabel] di warehouse. Filter: [mis. Company_Code = '6128', tahun berjalan].
Hindari kolom GUID (uniqueidentifier). Tunjukkan query SELECT-nya dulu untuk aku uji sebelum dijadikan tabel ringkasan.
```

### 5. Menambah tabel/entity baru
**Kapan:** butuh sumber data baru yang belum terdaftar di connector.

```
Buat entity connector baru [NamaEntity] untuk tabel [schema.Tabel] di rayfin/connectors/[nama connector]/,
kolom: [kolom: tipe, ...]. Daftarkan di schema.ts (import, entities, dan tipe).
Pastikan tabelnya benar-benar ada di warehouse — satu entity yang hilang membuat seluruh connector gagal.
```

### 6. Memperbaiki error
**Kapan:** muncul error saat `npm run typecheck`, `npm test`, `npm run build`, atau di app.

```
Perbaiki error ini. Jelaskan penyebabnya dulu dalam bahasa sederhana, baru ubah kodenya:
[paste error lengkap]
```

### 7. Mengubah tampilan
**Kapan:** ganti judul, warna, urutan bagian, atau menu.

```
Ubah [judul app / warna tema / urutan section / menu] di Dashboard.tsx menjadi [...].
Untuk warna, ubah token di global.css saja — jangan hardcode warna di komponen.
```

### 8. Cek sebelum publish
**Kapan:** sebelum `npx rayfin up`.

```
Jalankan npm run typecheck, npm test, dan npm run build berurutan. Kalau ada yang gagal, perbaiki
penyebabnya lalu jalankan ulang. Ringkas hasilnya untukku.
```

### 9. Commit & push ke GitHub
**Kapan:** perubahan sudah dicek dan ingin disimpan.

```
Commit perubahanku dengan pesan "[pesan]" lalu push ke GitHub (branch [main]).
Pastikan rayfin/.env, file .env, dan node_modules tidak ikut ter-commit.
```

### 10. Rollback
**Kapan:** perubahan terakhir bermasalah dan ingin kembali.

```
Tunjukkan riwayat commit terakhir. Aku mau kembali ke versi sebelum [perubahan]. Pakai git revert
(jangan hapus riwayat), jalankan cek typecheck/test/build, lalu tanya aku dulu sebelum npx rayfin up.
```

### 11. Pindah workspace
**Kapan:** deploy app yang sama ke workspace Fabric lain.

```
Aku mau deploy app ini ke workspace "[nama workspace]". Cek apakah warehouse di workspace itu punya
tabel yang sama, arahkan ulang connector ke warehouse di sana (ID-nya bisa beda walau namanya sama),
lalu tunjukkan rencana deploy (--dry-run) sebelum benar-benar deploy.
```

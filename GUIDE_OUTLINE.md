# Kerangka Modul: Membuat Fabric App

> Ini **kerangka**, bukan isi akhir. Setiap `TODO:` diisi manual oleh penulis guide.
> Poin bertanda ⚠️ adalah hal yang benar-benar terjadi saat membangun datacubeapp —
> sebaiknya tetap disebut di guide.
> Perintah di sini sudah dicek untuk Rayfin CLI **1.36.0**; cek ulang kalau versinya berubah.

---

## Prasyarat

- Akses Microsoft Fabric
  - Role **Contributor** atau lebih di workspace tujuan disarankan (membuat item, data agent, tabel di warehouse)
  - TODO: verifikasi role minimum untuk deploy app & menambah connector (di POC, CLI memperingatkan Viewer tapi `connector add` tetap berhasil)
  - TODO: penjelasan kapasitas Fabric yang dibutuhkan (cek dokumentasi resmi terbaru)
  - TODO: screenshot pengaturan workspace & role
- Node.js 20 atau lebih baru — `node --version`
  - TODO: link unduh + screenshot
- Git — `git --version`
  - TODO: link unduh
- VS Code + terminal
  - TODO: screenshot terminal di VS Code
- Akun GitHub (untuk bagian C)
- TODO: penjelasan singkat "apa itu Fabric App / Rayfin" untuk pemula

---

## A. Create Fabric App

1. Buat project dari template **blankapp** (Universal App)
   - `npm create @microsoft/rayfin@latest my-app -- --template blankapp`
   - Kenapa blankapp: template dasar yang sama dengan datacubeapp → file template langsung cocok
   - TODO: screenshot hasil `✔ Project created`
2. Masuk ke folder project — `cd my-app`
3. Login ke Fabric — `npx rayfin login`
   - TODO: screenshot jendela login
4. Kenali struktur folder
   - `packages/frontend/src/` = tampilan (yang akan diisi template)
   - `rayfin/rayfin.yml` = pengaturan app di Fabric (auth, hosting, connector)
   - TODO: diagram/screenshot struktur folder
5. Jalankan pertama kali — `npm run dev`
   - Membuat backend app di Fabric dan membuka app di browser
   - TODO: penjelasan pemilihan workspace saat pertama kali
   - ⚠️ Setelah connector warehouse ditambahkan (B2), JANGAN pakai `npm run dev` lagi — pakai `npm run dev:frontend` (lihat Troubleshooting)
   - TODO: screenshot halaman Welcome bawaan

---

## B. Create Visuals (pakai template)

1. Ambil repo template
   - TODO: link repo template di GitHub
   - TODO: cara download/clone untuk pemula
2. Pasang library chart (Plotly)
   - `npm install plotly.js-dist-min@^4.1.1 -w @rayfin-app/frontend`
   - `npm install -D @types/plotly.js@^3.0.14 -w @rayfin-app/frontend`
   - TODO: penjelasan apa itu `-w` (workspace)
3. Copy file
   - Isi `template/src/` → `packages/frontend/src/`, timpa `App.tsx`, `App.spec.tsx`, `Root.spec.tsx`, `global.css`
   - TODO: screenshot sebelum/sesudah copy
4. Ubah judul & menu — `src/dashboard/Dashboard.tsx`, bagian **KONFIGURASI**
5. Lihat hasilnya dengan data contoh — label **Sample data** muncul di atas
   - TODO: screenshot dashboard dengan data contoh
6. Pilih chart yang dipakai
   - Hapus `<ChartCard>` yang tidak perlu; salin satu untuk menambah
   - Tabel daftar komponen → lihat README
   - TODO: contoh menambah satu chart, langkah demi langkah
7. Cari tanda `👉 GANTI DI SINI` — hanya bagian itu yang perlu diubah
8. Butuh bantuan? Pakai prompt di `PROMPTS_FOR_CLAUDE.md`
   - TODO: contoh percakapan dengan Claude Code

---

## B2. Tentukan datamu sendiri (self-service)

> Kamu pegang kendali penuh: tulis query/entity sendiri, ATAU minta bantuan AI.
> Keduanya didukung.

1. Prinsip: semua data lewat **satu file** — `src/data/data.ts`
   - Chart hanya menggambar; data diatur di satu tempat
   - TODO: diagram alur warehouse → tabel ringkasan → connector → data.ts → chart
2. Cara A — data contoh (`sample-data.ts`)
   - Kapan dipakai: mencoba tampilan, demo
   - TODO: contoh mengganti angka contoh
3. Cara B — warehouse Fabric (cara datacubeapp)
   - Ikuti tabel langkah di `template/examples/warehouse/README.md`
   - Tulis SQL sebagai **tabel ringkasan** di warehouse (bukan view)
   - Kenapa ringkasan di SQL: mudah diaudit, cepat, tidak terpotong 100 baris
   - Daftarkan connector: `npx rayfin connector search …` → `npx rayfin connector add …`
   - Buat entity per tabel, daftarkan di `schema.ts`, sambungkan di `connectors.ts`
   - Aktifkan blok CARA B di `data.ts`, lalu `USING_SAMPLE_DATA = false`
   - TODO: walkthrough satu tabel dari SQL sampai tampil di chart
   - TODO: screenshot hasil `connector search` dan `connector add`
4. Bentuk data tiap chart
   - Tertulis di bagian atas setiap file `components/charts/*.tsx`
   - Rupiah dikirim mentah + `unit="IDR"` → tampil `Rp 793.9B`
   - TODO: tabel ringkas bentuk data per chart
5. Menambah tabel/entity baru
   - Tambah tabel di SQL → file entity baru → 3 baris di `schema.ts` → fungsi `load...()` baru
   - ⚠️ Lihat nama & tipe kolom di `metadata.json`, jangan menebak
   - TODO: contoh menambah entity kedua
6. Menjadwalkan refresh data
   - `EXEC app.usp_RefreshAppMetrics;` di Data Pipeline (harian, setelah data sumber ter-load)
   - TODO: screenshot pembuatan Data Pipeline + aktivitas Stored procedure

---

## C. Publish & Commit GitHub

1. Cek sebelum publish
   - `npm run typecheck` → `npm test` → `npm run build` (berurutan)
   - TODO: arti tiap perintah & cara membaca error-nya
2. Publish ke Fabric — `npx rayfin up`
   - Tambahkan `--dry-run` untuk melihat rencana tanpa mengubah apa pun
   - TODO: screenshot output + URL "Your app is live at"
   - TODO: cara memberi akses app ke user lain
3. Pindah / tambah workspace tujuan
   - `npx rayfin up --workspace "Nama Workspace"` → deployment baru
   - `npx rayfin up switch --list` / `npx rayfin up switch "<nama>"`
   - ⚠️ Pindah workspace = cek ulang connector: ID warehouse berbeda walau namanya sama
   - TODO: penjelasan kapan perlu beberapa deployment (dev/prod)
4. Simpan ke GitHub
   - `git init` (sekali) → `git add .` → `git commit -m "pesan"` → `git remote add origin <url>` → `git push -u origin main`
   - ⚠️ Jangan commit `rayfin/.env`, `.env*`, `node_modules` — sudah ada di `.gitignore`
   - TODO: screenshot membuat repo kosong di GitHub
   - TODO: aturan menulis pesan commit yang baik
5. Rollback (kembali ke versi sebelumnya)
   - Batalkan satu commit: `git revert <commit>` lalu `npx rayfin up`
   - Lihat riwayat: `git log --oneline`
   - Coba versi lama tanpa mengubah riwayat: `git checkout <commit>` → `npx rayfin up` → `git checkout main`
   - Catatan: `rayfin up switch` itu **pindah workspace tujuan**, bukan rollback
   - TODO: contoh skenario rollback

---

## D. Data Agent

1. Buat data agent di workspace — + New item → Data agent
   - Prasyarat: Contributor; fitur Copilot/Data agent aktif di tenant
   - TODO: screenshot
2. Pilih sumber data
   - Warehouse yang sama dengan app; centang **hanya** tabel yang perlu
   - Utamakan tabel ringkasan (angkanya sama dengan dashboard) + tabel detail seperlunya
   - ⚠️ Hindari kolom GUID (`uniqueidentifier`) — tidak terbaca lewat SQL endpoint; join pakai kolom kode teks
   - TODO: screenshot pemilihan tabel
3. Agent instructions
   - Isi: peran, bahasa jawaban, cakupan data (filter wajib), definisi bisnis, aturan SQL
   - ⚠️ Tulis SELURUH instructions dalam bahasa jawaban yang diinginkan — instructions campur bahasa membuat agent ikut bahasa yang dominan
   - TODO: contoh instructions (bisa diambil dari datacubeapp `docs/DATA_AGENT_SETUP.md`)
4. Data source instructions — penjelasan isi tiap tabel & kolom penting
   - TODO: contoh
5. Example queries — pasangan pertanyaan + SQL yang benar
   - TODO: 3–5 contoh
6. Uji di panel chat
   - Bandingkan jawaban dengan angka dashboard; buka "Show SQL" dan cek filter-nya
   - Uji pertanyaan di luar cakupan — agent harus menolak
   - TODO: tabel uji
7. Publish
   - ⚠️ Setiap mengubah instructions → **Publish ulang**; app memakai versi yang dipublish, bukan draft
   - Salin **MCP endpoint**: `https://api.fabric.microsoft.com/v1/mcp/workspaces/<ws>/dataagents/<id>/agent`
8. (Lanjutan) Integrasi ke app
   - Lewat **function** server-side (capability `functions`), supaya token Fabric tidak sampai ke browser
   - Function memanggil agent atas nama **pemilik item app** (akun yang men-deploy) → user app tidak perlu akses agent satu-satu, tapi semua user bertanya dengan hak akses pemilik
   - Batas waktu function di Fabric: 250 detik
   - TODO: penjelasan arsitektur + rujukan ke datacubeapp (`packages/functions/src/function_app.ts`)

---

## Troubleshooting

| Gejala | Penyebab | Perbaikan |
|---|---|---|
| "No connectors are declared in project settings" | `npm run dev` menghapus connector dari backend (CLI 1.36.0) | `npx rayfin up`; untuk lokal pakai `npm run dev:frontend` |
| Semua chart gagal, padahal sebagian tabel ada | Satu entity di `schema.ts` tidak ada di warehouse (atau berupa view) | Buat tabelnya, atau hapus entity itu dari `schema.ts` |
| "The summary table is not available yet" | Tabel ringkasan belum dibuat / connector belum di-deploy | Jalankan SQL di warehouse, lalu `npx rayfin up` |
| "You do not have permission…" | Akun/app tidak punya akses ke warehouse | Minta akses ke admin workspace |
| Angka di app tidak berubah | Procedure refresh belum dijalankan / belum dijadwalkan | `EXEC app.usp_RefreshAppMetrics;` + Data Pipeline |
| Error 15816 "not supported in distributed processing mode" | `INSERT … SELECT` membaca katalog sistem (`sys.*`) | Baca katalog ke variabel teks dulu, lalu INSERT lewat SQL dinamis |
| Build/typecheck error "declared but its value is never read" | Data contoh/impor tidak dipakai lagi setelah pindah ke Cara B | Hapus baris impor yang ditunjuk error |
| Test gagal mencari judul "Your app is taking shape" | `Root.spec.tsx`/`App.spec.tsx` bawaan belum diganti | Copy `App.spec.tsx` & `Root.spec.tsx` dari template |
| Data agent menjawab bahasa yang salah | Instructions campur bahasa / belum di-publish ulang | Seragamkan bahasa instructions, lalu Publish |
| TODO: | TODO: | TODO: |

/* ============================================================================
   CONTOH — tabel ringkasan di warehouse untuk dibaca Fabric App.
   Pola ini sama dengan datacubeapp (warehouse/app_metrics.sql).

   Kenapa tabel ringkasan, bukan baca tabel fakta langsung?
     - Logika bisnis (filter, periode, rumus) ada di SQL → mudah diaudit & diuji.
     - App hanya membaca puluhan baris → cepat, dan tidak terpotong batas
       100 baris per halaman dari connector.
     - Connector hanya bisa membaca TABEL fisik, BUKAN view.

   Cara pakai:
     1. 👉 GANTI DI SINI: semua yang ditulis <...> di bawah dengan nama asli
        di warehouse-mu.
     2. Uji SELECT-nya dulu sendirian sampai angkanya benar.
     3. Jalankan file ini SEKALI di SQL query editor warehouse.
     4. Jadwalkan `EXEC app.usp_RefreshAppMetrics;` (mis. Data Pipeline harian)
        supaya angka di app ikut diperbarui.

   Gotcha Fabric:
     - Kolom GUID (uniqueidentifier) tidak terbaca lewat SQL endpoint/connector.
       JOIN dan tampilkan kolom kode teks saja.
     - Fabric T-SQL: pakai varchar (bukan nvarchar); beri panjang pada setiap varchar.
     - Warehouse berisi banyak company/mata uang? Selalu filter, jangan jumlah lintas company.
   ============================================================================ */

-- 1. Schema dan tabel (aman dijalankan ulang) --------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'app')
    EXEC('CREATE SCHEMA app');
GO

-- Satu baris per bulan: revenue, COGS, target. Angka dalam mata uang aslinya.
IF OBJECT_ID('app.RevenueMonthly', 'U') IS NULL
    CREATE TABLE app.RevenueMonthly (
    MonthStart date NOT NULL,
    Revenue decimal(19,2) NOT NULL,
    Cogs decimal(19,2) NOT NULL,
    GrossProfit decimal(19,2) NOT NULL,
    Target decimal(19,2) NOT NULL
    );
GO

-- 2. Procedure refresh: hapus isi lalu isi ulang, dalam satu transaksi -------
CREATE OR ALTER PROCEDURE app.usp_RefreshAppMetrics AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    DELETE FROM app.RevenueMonthly;
    INSERT INTO app.RevenueMonthly (MonthStart, Revenue, Cogs, GrossProfit, Target)
    SELECT rv.MonthStart,
        CAST(rv.Revenue AS decimal(19,2)),
        CAST(rv.Cogs AS decimal(19,2)),
        CAST(rv.Revenue - rv.Cogs AS decimal(19,2)),
        CAST(ISNULL(tg.Target, 0) AS decimal(19,2))
    FROM (
        SELECT DATEFROMPARTS(YEAR(r.<InvoiceDate>), MONTH(r.<InvoiceDate>), 1) AS MonthStart,
               SUM(ISNULL(r.<RevenueAmount>, 0)) AS Revenue,
               SUM(ISNULL(r.<CogsAmount>, 0)) AS Cogs
        FROM <schema>.<FactRevenueTable> r
        WHERE r.<CompanyCode> = '<kode company>'
          AND r.<InvoiceDate> >= DATEADD(month, -23, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
        GROUP BY DATEFROMPARTS(YEAR(r.<InvoiceDate>), MONTH(r.<InvoiceDate>), 1)
    ) rv
    LEFT JOIN (
        SELECT DATEFROMPARTS(YEAR(t.<TargetDate>), MONTH(t.<TargetDate>), 1) AS MonthStart,
               SUM(t.<TargetAmount>) AS Target
        FROM <schema>.<FactTargetTable> t
        WHERE t.<CompanyCode> = '<kode company>'
        GROUP BY DATEFROMPARTS(YEAR(t.<TargetDate>), MONTH(t.<TargetDate>), 1)
    ) tg ON tg.MonthStart = rv.MonthStart;

    -- Tambah tabel ringkasan lain di sini dengan pola DELETE + INSERT yang sama.

    COMMIT TRANSACTION;
END;
GO

-- 3. Isi pertama kali, lalu cek ------------------------------------------------
EXEC app.usp_RefreshAppMetrics;
GO

SELECT * FROM app.RevenueMonthly ORDER BY MonthStart;

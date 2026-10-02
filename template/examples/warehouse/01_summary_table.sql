/* ============================================================================
   EXAMPLE — a summary table in the warehouse for the Fabric App to read.
   Same pattern as datacubeapp (warehouse/app_metrics.sql).

   Why a summary table instead of reading the fact table directly?
     - Business logic (filters, periods, formulas) lives in SQL → easy to audit & test.
     - The app only reads a few dozen rows → fast, and not cut off by the
       connector's 100-rows-per-page limit.
     - The connector can only read physical TABLES, NOT views.

   How to use:
     1. 👉 CHANGE HERE: everything written as <...> below, using the real names
        in your warehouse.
     2. Test the SELECT on its own first until the numbers are right.
     3. Run this file ONCE in the warehouse SQL query editor.
     4. Schedule `EXEC app.usp_RefreshAppMetrics;` (e.g. a daily Data Pipeline)
        so the numbers in the app stay up to date.

   Fabric gotchas:
     - GUID (uniqueidentifier) columns can't be read through the SQL endpoint/connector.
       JOIN on and display text code columns only.
     - Fabric T-SQL: use varchar (not nvarchar); give every varchar a length.
     - Warehouse holds multiple companies/currencies? Always filter; never sum across companies.
   ============================================================================ */

-- 1. Schema and table (safe to re-run) ---------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'app')
    EXEC('CREATE SCHEMA app');
GO

-- One row per month: revenue, COGS, target. Amounts in their original currency.
IF OBJECT_ID('app.RevenueMonthly', 'U') IS NULL
    CREATE TABLE app.RevenueMonthly (
    MonthStart date NOT NULL,
    Revenue decimal(19,2) NOT NULL,
    Cogs decimal(19,2) NOT NULL,
    GrossProfit decimal(19,2) NOT NULL,
    Target decimal(19,2) NOT NULL
    );
GO

-- 2. Refresh procedure: clear and refill, inside one transaction -------------
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
        WHERE r.<CompanyCode> = '<company code>'
          AND r.<InvoiceDate> >= DATEADD(month, -23, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
        GROUP BY DATEFROMPARTS(YEAR(r.<InvoiceDate>), MONTH(r.<InvoiceDate>), 1)
    ) rv
    LEFT JOIN (
        SELECT DATEFROMPARTS(YEAR(t.<TargetDate>), MONTH(t.<TargetDate>), 1) AS MonthStart,
               SUM(t.<TargetAmount>) AS Target
        FROM <schema>.<FactTargetTable> t
        WHERE t.<CompanyCode> = '<company code>'
        GROUP BY DATEFROMPARTS(YEAR(t.<TargetDate>), MONTH(t.<TargetDate>), 1)
    ) tg ON tg.MonthStart = rv.MonthStart;

    -- Add other summary tables here using the same DELETE + INSERT pattern.

    COMMIT TRANSACTION;
END;
GO

-- 3. Initial load, then check ------------------------------------------------
EXEC app.usp_RefreshAppMetrics;
GO

SELECT * FROM app.RevenueMonthly ORDER BY MonthStart;

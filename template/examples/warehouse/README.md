# Data from a Fabric warehouse (Option B)

The steps actually used in datacubeapp to read from the warehouse.
The examples in this folder use the connector name **`warehouse`** and a single table
**`app.RevenueMonthly`**. Change both to match your project.

| Step | What to do | Example file |
|---|---|---|
| 1 | Install the connector capability (once, from the project root): `npm run pack:add -- connectors` | — |
| 2 | Create the summary table in the warehouse; run it in the SQL query editor | `01_summary_table.sql` |
| 3 | Find your warehouse: `npx rayfin connector search --all-workspaces --type fabric-warehouse` | — |
| 4 | Register the connector (copy the `workspace-id` & `item-id` from step 3): `npx rayfin connector add --type fabric-warehouse --workspace-id <ws> --item-id <item> --name warehouse --operations read` | — |
| 5 | Create an entity per table in `rayfin/connectors/warehouse/` | `02_RevenueMonthly.ts` |
| 6 | Replace `rayfin/connectors/warehouse/schema.ts` | `03_schema.ts` |
| 7 | Replace `packages/frontend/src/lib/connectors.ts` | `04_connectors.ts` |
| 8 | In `src/data/data.ts`: delete `return sample...;`, enable the OPTION B block | `data.ts` |
| 9 | Check, then deploy: `npm run typecheck` → `npm test` → `npm run build` → `npx rayfin up` | — |

## Common causes of failure (hit in datacubeapp)

- **Tables only, not views.** The connector can't read views. If your logic lives
  in a view, copy its result into a table through a procedure (see `01_summary_table.sql`).
- **One missing table = everything fails.** Every entity in `schema.ts` must exist
  in the warehouse. A single missing one causes the whole connector to be rejected.
- **GUID columns can't be read.** Don't map `uniqueidentifier` columns; use text code columns.
- **Don't guess column names.** Check `rayfin/connectors/warehouse/metadata.json`
  (generated automatically in step 4) for the actual column names and types.
- **`connector add --yes` overwrites `schema.ts`** with a placeholder. When re-running
  it, don't use `--yes`, or restore your `schema.ts` from git afterwards.
- **`npm run dev` removes connectors** from the already-deployed backend (Rayfin CLI 1.36.0).
  Once connectors exist, run locally with `npm run dev:frontend`. If it already
  happened, restore them with `npx rayfin up`.
- **100-row limit.** `findMany()` fetches a single page. Summary tables should
  be small; if one has more than 100 rows, use
  `.select([...]).first(1000).execute()` like `fetchMigration` in datacubeapp.

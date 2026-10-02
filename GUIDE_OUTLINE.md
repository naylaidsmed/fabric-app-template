# Module Outline: Building a Fabric App

> This is an **outline**, not the final content. Each `TODO:` is filled in manually by the guide author.
> Items marked ⚠️ are things that actually happened while building datacubeapp —
> they should still be mentioned in the guide.
> The commands here have been checked against Rayfin CLI **1.36.0**; re-check them if the version changes.

---

## Prerequisites

- Microsoft Fabric access
  - **Contributor** role or higher on the target workspace is recommended (to create items, data agents, warehouse tables)
  - TODO: verify the minimum role for deploying the app & adding a connector (in the POC, the CLI warned about Viewer but `connector add` still succeeded)
  - TODO: explain the Fabric capacity required (check the latest official docs)
  - TODO: screenshot of workspace & role settings
- Node.js 20 or newer — `node --version`
  - TODO: download link + screenshot
- Git — `git --version`
  - TODO: download link
- VS Code + terminal
  - TODO: screenshot of the terminal in VS Code
- GitHub account (for part C)
- TODO: short "what is a Fabric App / Rayfin" explanation for beginners

---

## A. Create Fabric App

1. Create a project from the **blankapp** (Universal App) template
   - `npm create @microsoft/rayfin@latest my-app -- --template blankapp`
   - Why blankapp: it's the same base template as datacubeapp → the template files fit directly
   - TODO: screenshot of the `✔ Project created` output
2. Go into the project folder — `cd my-app`
3. Sign in to Fabric — `npx rayfin login`
   - TODO: screenshot of the sign-in window
4. Get to know the folder structure
   - `packages/frontend/src/` = the UI (what the template fills in)
   - `rayfin/rayfin.yml` = the app's settings in Fabric (auth, hosting, connectors)
   - TODO: diagram/screenshot of the folder structure
5. First run — `npm run dev`
   - Creates the app backend in Fabric and opens the app in the browser
   - TODO: explain picking a workspace on the first run
   - ⚠️ After the warehouse connector is added (B2), DO NOT use `npm run dev` again — use `npm run dev:frontend` (see Troubleshooting)
   - TODO: screenshot of the default Welcome page

---

## B. Create Visuals (using the template)

1. Get the template repo
   - TODO: link to the template repo on GitHub
   - TODO: how to download/clone, for beginners
2. Install the chart library (Plotly)
   - `npm install plotly.js-dist-min@^4.1.1 -w @rayfin-app/frontend`
   - `npm install -D @types/plotly.js@^3.0.14 -w @rayfin-app/frontend`
   - TODO: explain what `-w` (workspace) means
3. Copy the files
   - Contents of `template/src/` → `packages/frontend/src/`, overwriting `App.tsx`, `App.spec.tsx`, `Root.spec.tsx`, `global.css`
   - TODO: before/after screenshot of the copy
4. Change the title & menu — `src/dashboard/Dashboard.tsx`, **CONFIGURATION** section
5. View the result with sample data — the **Sample data** label appears at the top
   - TODO: screenshot of the dashboard with sample data
6. Choose which charts to use
   - Delete the `<ChartCard>`s you don't need; copy one to add more
   - Component list table → see the README
   - TODO: step-by-step example of adding one chart
7. Look for the `👉 CHANGE HERE` marker — only those parts need editing
8. Need help? Use the prompts in `PROMPTS_FOR_CLAUDE.md`
   - TODO: example conversation with Claude Code

---

## B2. Define your own data (self-service)

> You have full control: write the queries/entities yourself, OR ask AI for help.
> Both are supported.

1. Principle: all data goes through **one file** — `src/data/data.ts`
   - Charts only draw; data is configured in one place
   - TODO: flow diagram warehouse → summary table → connector → data.ts → chart
2. Option A — sample data (`sample-data.ts`)
   - When to use: trying out the layout, demos
   - TODO: example of changing the sample numbers
3. Option B — Fabric warehouse (the datacubeapp way)
   - Follow the step table in `template/examples/warehouse/README.md`
   - Write the SQL as a **summary table** in the warehouse (not a view)
   - Why summarize in SQL: easy to audit, fast, not cut off at 100 rows
   - Register the connector: `npx rayfin connector search …` → `npx rayfin connector add …`
   - Create an entity per table, register it in `schema.ts`, wire it up in `connectors.ts`
   - Enable the OPTION B block in `data.ts`, then `USING_SAMPLE_DATA = false`
   - TODO: walkthrough of one table from SQL all the way to a chart
   - TODO: screenshot of the `connector search` and `connector add` output
4. Data shape for each chart
   - Documented at the top of every `components/charts/*.tsx` file
   - Rupiah passed raw + `unit="IDR"` → displayed as `Rp 793.9B`
   - TODO: summary table of data shapes per chart
5. Adding a new table/entity
   - Add the table in SQL → new entity file → 3 lines in `schema.ts` → new `load...()` function
   - ⚠️ Check column names & types in `metadata.json`, don't guess
   - TODO: example of adding a second entity
6. Scheduling data refresh
   - `EXEC app.usp_RefreshAppMetrics;` in a Data Pipeline (daily, after the source data has loaded)
   - TODO: screenshot of creating a Data Pipeline + Stored procedure activity

---

## C. Publish & Commit to GitHub

1. Check before publishing
   - `npm run typecheck` → `npm test` → `npm run build` (in order)
   - TODO: what each command means & how to read its errors
2. Publish to Fabric — `npx rayfin up`
   - Add `--dry-run` to see the plan without changing anything
   - TODO: screenshot of the output + "Your app is live at" URL
   - TODO: how to give other users access to the app
3. Switch / add a target workspace
   - `npx rayfin up --workspace "Workspace Name"` → new deployment
   - `npx rayfin up switch --list` / `npx rayfin up switch "<name>"`
   - ⚠️ Switching workspaces = re-check the connector: the warehouse ID differs even if the name is the same
   - TODO: explain when you need multiple deployments (dev/prod)
4. Save to GitHub
   - `git init` (once) → `git add .` → `git commit -m "message"` → `git remote add origin <url>` → `git push -u origin main`
   - ⚠️ Don't commit `rayfin/.env`, `.env*`, `node_modules` — they're already in `.gitignore`
   - TODO: screenshot of creating an empty repo on GitHub
   - TODO: guidelines for writing good commit messages
5. Rollback (going back to a previous version)
   - Undo one commit: `git revert <commit>` then `npx rayfin up`
   - View history: `git log --oneline`
   - Try an old version without changing history: `git checkout <commit>` → `npx rayfin up` → `git checkout main`
   - Note: `rayfin up switch` **switches the target workspace**, it is not a rollback
   - TODO: example rollback scenario

---

## D. Data Agent

1. Create a data agent in the workspace — + New item → Data agent
   - Prerequisites: Contributor; Copilot/Data agent features enabled in the tenant
   - TODO: screenshot
2. Choose the data source
   - The same warehouse as the app; tick **only** the tables you need
   - Prefer summary tables (their numbers match the dashboard) + detail tables only as needed
   - ⚠️ Avoid GUID columns (`uniqueidentifier`) — they can't be read through the SQL endpoint; join on text code columns
   - TODO: screenshot of table selection
3. Agent instructions
   - Contents: role, answer language, data scope (mandatory filters), business definitions, SQL rules
   - ⚠️ Write ALL instructions in the language you want answers in — mixed-language instructions make the agent follow the dominant language
   - TODO: example instructions (can be taken from datacubeapp `docs/DATA_AGENT_SETUP.md`)
4. Data source instructions — describe each table and its important columns
   - TODO: example
5. Example queries — pairs of question + correct SQL
   - TODO: 3–5 examples
6. Test in the chat panel
   - Compare answers with the dashboard numbers; open "Show SQL" and check its filters
   - Test out-of-scope questions — the agent should refuse
   - TODO: test table
7. Publish
   - ⚠️ Every time you change the instructions → **Publish again**; the app uses the published version, not the draft
   - Copy the **MCP endpoint**: `https://api.fabric.microsoft.com/v1/mcp/workspaces/<ws>/dataagents/<id>/agent`
8. (Advanced) Integrating into the app
   - Through a server-side **function** (`functions` capability), so the Fabric token never reaches the browser
   - The function calls the agent on behalf of the **app item owner** (the account that deployed it) → app users don't each need agent access, but every user asks with the owner's permissions
   - Fabric function timeout: 250 seconds
   - TODO: architecture explanation + reference to datacubeapp (`packages/functions/src/function_app.ts`)

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "No connectors are declared in project settings" | `npm run dev` removes connectors from the backend (CLI 1.36.0) | `npx rayfin up`; for local work use `npm run dev:frontend` |
| Every chart fails, even though some tables exist | One entity in `schema.ts` doesn't exist in the warehouse (or is a view) | Create the table, or remove that entity from `schema.ts` |
| "The summary table is not available yet" | Summary table not created yet / connector not deployed yet | Run the SQL in the warehouse, then `npx rayfin up` |
| "You do not have permission…" | The account/app has no access to the warehouse | Ask the workspace admin for access |
| Numbers in the app don't change | Refresh procedure hasn't been run / isn't scheduled | `EXEC app.usp_RefreshAppMetrics;` + Data Pipeline |
| Error 15816 "not supported in distributed processing mode" | `INSERT … SELECT` reads the system catalog (`sys.*`) | Read the catalog into a text variable first, then INSERT via dynamic SQL |
| Build/typecheck error "declared but its value is never read" | Sample data/imports no longer used after moving to Option B | Delete the import line the error points to |
| Test fails looking for the title "Your app is taking shape" | The default `Root.spec.tsx`/`App.spec.tsx` haven't been replaced | Copy `App.spec.tsx` & `Root.spec.tsx` from the template |
| Data agent answers in the wrong language | Mixed-language instructions / not published again | Make the instructions one language, then Publish |
| TODO: | TODO: | TODO: |

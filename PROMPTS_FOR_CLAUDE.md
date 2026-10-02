# Ready-to-use prompts for Claude Code

Copy a prompt, fill in the `[...]` parts, then paste it into Claude Code opened in
your project folder. Claude will read the project's `AGENTS.md` and follow this
template's patterns.

> Tip: name files/charts exactly as they appear in the project (e.g. `Dashboard.tsx`,
> `BarChart`, `loadMonthly`) so Claude doesn't have to guess.

---

### 1. Add a chart
**When:** you want a new visual on the dashboard from data you already have.

```
Add a [type: LineChart/BarChart/DonutChart/...] chart to Dashboard.tsx in the [section name] section,
titled "[title]", showing [metric] by [dimension].
Get the data from a new load[Name]() function in src/data/data.ts (use sample data in sample-data.ts first).
Follow the existing <ChartCard> + <DataState> pattern, and the data shape documented at the top of the chart component file.
```

### 2. Replace sample data with warehouse data
**When:** the layout looks good, and now you want real numbers.

```
Change the [load...] function in src/data/data.ts so it reads the [schema.Table] table in the warehouse through the [connector name] connector,
columns [column1, column2, ...]. Follow the OPTION B block and the example in template/examples/warehouse.
Check the column names & types in rayfin/connectors/[connector name]/metadata.json — don't guess.
```

### 3. Wire up my own SQL
**When:** you already have a SQL query and want its result shown in a chart.

```
I have this query for the [chart name] chart:
[paste SQL]
Turn it into a summary table in the warehouse (app schema, DELETE + INSERT pattern inside a procedure like
template/examples/warehouse/01_summary_table.sql), create its connector entity, register it in schema.ts,
and wire it up to a load...() function in data.ts. Don't use a view — the connector can only read tables.
```

### 4. Help writing a query
**When:** you know the numbers you want, but not the query yet.

```
Help me write a SQL query for [metric, e.g. revenue per month] by [dimension, e.g. branch]
from the [schema.Table] table in the warehouse. Filter: [e.g. Company_Code = '6128', current year].
Avoid GUID (uniqueidentifier) columns. Show me the SELECT query first so I can test it before turning it into a summary table.
```

### 5. Add a new table/entity
**When:** you need a new data source that isn't registered in the connector yet.

```
Create a new connector entity [EntityName] for the [schema.Table] table in rayfin/connectors/[connector name]/,
columns: [column: type, ...]. Register it in schema.ts (import, entities, and the type).
Make sure the table really exists in the warehouse — a single missing entity makes the whole connector fail.
```

### 6. Fix an error
**When:** an error appears during `npm run typecheck`, `npm test`, `npm run build`, or in the app.

```
Fix this error. Explain the cause in plain language first, then change the code:
[paste full error]
```

### 7. Change the look
**When:** changing the title, colors, section order, or menu.

```
Change the [app title / theme colors / section order / menu] in Dashboard.tsx to [...].
For colors, only change the tokens in global.css — don't hardcode colors in components.
```

### 8. Check before publishing
**When:** before `npx rayfin up`.

```
Run npm run typecheck, npm test, and npm run build in order. If any of them fails, fix
the cause and run it again. Summarize the results for me.
```

### 9. Commit & push to GitHub
**When:** your changes have been checked and you want to save them.

```
Commit my changes with the message "[message]" then push to GitHub (branch [main]).
Make sure rayfin/.env, .env files, and node_modules are not committed.
```

### 10. Rollback
**When:** the latest change is broken and you want to go back.

```
Show me the recent commit history. I want to go back to the version before [change]. Use git revert
(don't delete history), run the typecheck/test/build checks, then ask me before running npx rayfin up.
```

### 11. Switch workspace
**When:** deploying the same app to a different Fabric workspace.

```
I want to deploy this app to the "[workspace name]" workspace. Check whether the warehouse in that workspace has
the same tables, re-point the connector to the warehouse there (its ID may differ even if the name is the same),
then show me the deploy plan (--dry-run) before actually deploying.
```

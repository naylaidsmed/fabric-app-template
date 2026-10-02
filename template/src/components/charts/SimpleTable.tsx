// 📋 SimpleTable — a compact scrollable table, for lists that need to be read row by row.
// Taken from datacubeapp: the "Needs Attention" table in the IT / Data section.
//
// Data shape: any rows; the columns shown are defined through `columns`.
//   [{ table: 'dbo.T2', rows: 0, status: 'Empty' }, ...]
//
// Example:
//   <SimpleTable data={rows} emptyText="All tables are loaded."
//     columns={[
//       { key: 'table', header: 'Table' },
//       { key: 'rows', header: 'Rows', align: 'right', format: (v) => formatCount(Number(v)) },
//       { key: 'status', header: 'Status' },
//     ]} />

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface TableColumn<T> {
  key: keyof T & string;
  header: string;
  align?: 'left' | 'right';
  /** Customize how the value is displayed, e.g. number formatting or a colored badge. */
  format?: (value: T[keyof T], row: T) => ReactNode;
}

export interface SimpleTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  /** Message shown when there is no data. */
  emptyText?: string;
}

export function SimpleTable<T>({ data, columns, emptyText = 'No rows.' }: SimpleTableProps<T>) {
  if (data.length === 0) {
    return <p className="rounded-2xl bg-good-soft p-400 text-300 text-good">{emptyText}</p>;
  }
  return (
    <div className="max-h-80 overflow-auto">
      <table className="w-full border-collapse text-300">
        <thead>
          <tr className="text-left text-200 text-muted-foreground">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'border-b border-border px-300 py-200 font-semibold',
                  col.align === 'right' && 'text-right'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'border-b border-border px-300 py-200',
                    col.align === 'right' && 'text-right font-numeric'
                  )}
                >
                  {col.format ? col.format(row[col.key], row) : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

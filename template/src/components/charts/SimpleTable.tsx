// 📋 SimpleTable — tabel ringkas yang bisa di-scroll, untuk daftar yang perlu dibaca baris per baris.
// Diambil dari datacubeapp: tabel "Needs Attention" di bagian IT / Data.
//
// Bentuk data: baris apa saja; kolom yang tampil ditentukan lewat `columns`.
//   [{ table: 'dbo.T2', rows: 0, status: 'Empty' }, ...]
//
// Contoh:
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
  /** Ubah tampilan nilai, mis. format angka atau badge warna. */
  format?: (value: T[keyof T], row: T) => ReactNode;
}

export interface SimpleTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  /** Pesan saat data kosong. */
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

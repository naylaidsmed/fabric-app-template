// 📊 KpiCard — satu kartu angka utama + perubahan dibanding tahun lalu.
// Diambil dari datacubeapp (dashboard/executive.tsx → KpiCard, kpiDelta).
//
// Bentuk data:
//   label      teks      "Total Revenue (YTD)"
//   value      angka     nilai sekarang (null = belum ada → tampil "—")
//   prevValue  angka     nilai periode pembanding, opsional (null = tanpa ▲▼)
//   unit       'IDR' | 'count' | 'pct'
//
// Contoh:
//   <KpiCard label="Total Revenue (YTD)" value={200e9} prevValue={160e9} unit="IDR" />
//
// Perubahan: untuk IDR/count dalam % ("▲ 25.0% vs last year"); untuk persen
// dalam poin ("▲ 5.0 pts vs last year"), karena "persen dari persen" membingungkan.

import { formatCount, formatIdr, formatPct } from '@/lib/format';
import { cn } from '@/lib/utils';

export type KpiUnit = 'IDR' | 'count' | 'pct';

export interface KpiCardProps {
  label: string;
  value: number | null;
  prevValue?: number | null;
  unit: KpiUnit;
}

function formatKpiValue(value: number | null, unit: KpiUnit): string {
  if (value == null) return '—';
  if (unit === 'IDR') return formatIdr(value);
  if (unit === 'pct') return formatPct(value);
  return formatCount(value);
}

/** Change vs the same period last year: % for amounts/counts, points for percentages. */
function kpiDelta(
  value: number | null,
  prevValue: number | null | undefined,
  unit: KpiUnit
): { text: string; direction: 'up' | 'down' | 'flat' } | null {
  if (value == null || prevValue == null) return null;
  if (unit === 'pct') {
    const points = value - prevValue;
    const direction = points > 0 ? 'up' : points < 0 ? 'down' : 'flat';
    return { text: `${formatPct(Math.abs(points)).replace('%', '')} pts vs last year`, direction };
  }
  if (prevValue === 0) return null;
  const pct = ((value - prevValue) / Math.abs(prevValue)) * 100;
  const direction = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
  return { text: `${formatPct(Math.abs(pct))} vs last year`, direction };
}

export function KpiCard({ label, value, prevValue, unit }: KpiCardProps) {
  const delta = kpiDelta(value, prevValue, unit);
  return (
    <div className="rounded-3xl border border-border bg-card p-400 text-card-foreground shadow-card">
      <div className="mb-100 text-200 text-muted-foreground">{label}</div>
      <div className="font-numeric text-600 font-bold leading-600 tracking-tight">
        {formatKpiValue(value, unit)}
      </div>
      {delta ? (
        <div
          className={cn(
            'mt-100 text-200 font-semibold',
            delta.direction === 'up' && 'text-good',
            delta.direction === 'down' && 'text-bad',
            delta.direction === 'flat' && 'text-muted-foreground'
          )}
        >
          {delta.direction === 'up' ? '▲' : delta.direction === 'down' ? '▼' : '■'} {delta.text}
        </div>
      ) : null}
    </div>
  );
}

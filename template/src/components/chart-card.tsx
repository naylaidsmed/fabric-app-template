// ✅ TIDAK PERLU DIUBAH. Diambil apa adanya dari datacubeapp (components/chart-card.tsx).
// <ChartCard> = kartu putih berjudul tempat chart diletakkan.
// <DataState> = menampilkan skeleton saat loading, pesan error + tombol "Try again",
// atau pesan kosong — lalu chart-nya saat data siap.

import type { ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

import type { AsyncResource } from '@/hooks/use-async';
import { describeError } from '@/lib/errors';
import { cn } from '@/lib/utils';

interface CardProps {
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}

/** White rounded card with a title row — the frame every chart sits in. */
export function ChartCard({ title, subtitle, className, children }: CardProps) {
  return (
    <section
      className={cn(
        'flex min-w-0 flex-col rounded-3xl border border-border bg-card p-400 pb-300 text-card-foreground shadow-card',
        className
      )}
      aria-label={title}
    >
      <h3 className="text-300 font-semibold leading-300">{title}</h3>
      {subtitle ? (
        <p className="mb-300 text-200 leading-200 text-muted-foreground">{subtitle}</p>
      ) : (
        <div className="mb-300" />
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
}

interface DataStateProps<T> {
  resource: AsyncResource<T>;
  /** Height of the skeleton, matching the content it stands in for. */
  height?: number;
  isEmpty?: (data: T) => boolean;
  emptyMessage?: string;
  children: (data: T) => ReactNode;
}

/** Loading skeleton, actionable error, empty message, or the content. */
export function DataState<T>({
  resource,
  height = 300,
  isEmpty,
  emptyMessage = 'No data for this period yet.',
  children,
}: DataStateProps<T>) {
  const { state, reload } = resource;

  if (state.status === 'loading') {
    return (
      <div
        className="animate-pulse rounded-2xl bg-muted"
        style={{ height }}
        role="status"
        aria-label="Loading data"
      />
    );
  }

  if (state.status === 'error') {
    const { title, hint } = describeError(state.error);
    const detail = state.error instanceof Error ? state.error.message : String(state.error);
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-200 rounded-2xl bg-bad-soft p-400 text-center"
        style={{ minHeight: height }}
      >
        <AlertTriangle className="icon-size-400 text-bad" aria-hidden />
        <p className="text-300 font-semibold text-bad">{title}</p>
        <p className="max-w-sm text-200 text-muted-foreground">{hint}</p>
        <button
          type="button"
          onClick={reload}
          className="mt-100 inline-flex items-center gap-100 rounded-full border border-border bg-card px-300 py-100 text-200 font-semibold text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
        >
          <RotateCcw className="icon-size-100" aria-hidden /> Try again
        </button>
        {import.meta.env.DEV ? (
          <details className="max-w-full text-left text-200 text-muted-foreground">
            <summary className="cursor-pointer">Technical details</summary>
            <pre className="mt-100 max-h-32 overflow-auto whitespace-pre-wrap">{detail}</pre>
          </details>
        ) : null}
      </div>
    );
  }

  if (isEmpty?.(state.data)) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-muted text-300 text-muted-foreground"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return <>{children(state.data)}</>;
}

// ✅ TIDAK PERLU DIUBAH. Diambil apa adanya dari datacubeapp (hooks/use-async.ts).
// Menjalankan fungsi pengambil data sekali, lalu memberi status loading / error / ready.

import { useCallback, useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'ready'; data: T };

export interface AsyncResource<T> {
  state: AsyncState<T>;
  /** Runs the loader again, e.g. from a "Coba lagi" button. */
  reload: () => void;
}

/**
 * Runs `load` once on mount and exposes loading / error / ready.
 * No automatic retry: connector failures are configuration or permission
 * problems, so they surface immediately with a manual retry.
 */
export function useAsync<T>(load: () => Promise<T>): AsyncResource<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => {
        if (!cancelled) setState({ status: 'ready', data });
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: 'error', error });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [load, attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, reload };
}

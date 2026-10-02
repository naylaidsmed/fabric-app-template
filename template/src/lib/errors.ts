// ✅ TIDAK PERLU DIUBAH. Diambil dari datacubeapp (lib/errors.ts).
// Mengubah error dari connector/warehouse menjadi pesan singkat yang bisa
// ditindaklanjuti user, ditampilkan oleh <DataState> di setiap kartu chart.

import { MissingRayfinConfigError } from '@/lib/rayfin-client';

/** Turns a connector failure into a short, actionable message. */
export function describeError(error: unknown): { title: string; hint: string } {
  if (error instanceof MissingRayfinConfigError) {
    return {
      title: 'The app configuration is incomplete.',
      hint: 'Start the app with `npm run dev:frontend` so the Fabric backend address is set.',
    };
  }
  const message = error instanceof Error ? error.message : String(error);
  if (/\b(401|403)\b|forbidden|unauthori[sz]ed|permission/i.test(message)) {
    return {
      title: 'You do not have permission to read this data.',
      hint: 'Ask the workspace admin for access to the app or the warehouse.',
    };
  }
  if (/invalid object name|does not exist|not found|unknown field/i.test(message)) {
    return {
      title: 'The summary table is not available yet.',
      hint: 'Make sure the summary-table SQL has been run in the warehouse and the connector is deployed.',
    };
  }
  return {
    title: 'The data could not be loaded.',
    hint: 'Try again. If it keeps failing, check the connection to the warehouse.',
  };
}

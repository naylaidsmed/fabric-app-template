// ✅ NO CHANGES NEEDED. Taken as-is from datacubeapp (lib/format.ts).
// English number formatting: Rp 793.9B (B = billion), 66.3%, Sep 24, 2026.

/**
 * English number formatting for the dashboard.
 *
 * Amounts in the warehouse are IDR. They are shown in the English short scale:
 * "M" (million, 10^6), "B" (billion, 10^9) and "T" (trillion, 10^12).
 * Note the Indonesian "M" (miliar) is a billion — never mix the two.
 */

const LOCALE = 'en-US';

const oneDecimal = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const whole = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

/** Rp 793.9B — compact Rupiah with a short-scale suffix. */
export function formatIdr(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (abs >= 1e12) return `${sign}Rp ${oneDecimal.format(abs / 1e12)}T`;
  if (abs >= 1e9) return `${sign}Rp ${oneDecimal.format(abs / 1e9)}B`;
  if (abs >= 1e6) return `${sign}Rp ${oneDecimal.format(abs / 1e6)}M`;
  return `${sign}Rp ${whole.format(abs)}`;
}

/** 3,412 — grouped integer. */
export function formatCount(value: number): string {
  return whole.format(value);
}

/** 66.3% */
export function formatPct(value: number): string {
  return `${oneDecimal.format(value)}%`;
}

/** Sep 24, 2026 */
export function formatDate(value: Date): string {
  return value.toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Sep 29, 2026, 11:30 AM — local time for "last refreshed". */
export function formatDateTime(value: Date): string {
  return value.toLocaleString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "Sep 26" axis label for a month start. */
export function formatMonth(value: Date): string {
  return value.toLocaleDateString(LOCALE, {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  });
}

/** IDR → billions (10^9), the unit used on chart axes ("B"). */
export function toBillions(value: number): number {
  return value / 1e9;
}

/**
 * Connector rows can carry dates as Date or ISO strings and decimals as
 * numbers or numeric strings, depending on the transport. Normalize once at the
 * data boundary so components only ever see Date and number.
 */
export function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}

export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

import type { SchoolEvent } from '@/types';

/** Today's date in local time as YYYY-MM-DD. */
export function todayISO(): string {
  const d = new Date();
  return toISO(d);
}

export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Adds whole days to a YYYY-MM-DD date. */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return toISO(new Date(y, m - 1, d + days));
}

/** Whole days from `a` to `b` (both YYYY-MM-DD). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

export function formatDay(iso: string, withYear = false): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  });
}

export type ListingState = 'listed' | 'scheduled' | 'closed';

/** Whether parents can see the event in their feedback form today. Both ends are inclusive. */
export function listingState(e: SchoolEvent, today = todayISO()): ListingState {
  if (e.listFrom && today < e.listFrom) return 'scheduled';
  if (e.listUntil && today > e.listUntil) return 'closed';
  return 'listed';
}

export function isListed(e: SchoolEvent, today = todayISO()): boolean {
  return listingState(e, today) === 'listed';
}

/** Short human label, e.g. "Open · closes in 5 days". */
export function listingLabel(e: SchoolEvent, today = todayISO()): string {
  const state = listingState(e, today);
  if (state === 'scheduled') return `Opens ${formatDay(e.listFrom!)}`;
  if (state === 'closed') return `Closed ${formatDay(e.listUntil!)}`;
  if (!e.listUntil) return 'Open · no end date';
  const left = daysBetween(today, e.listUntil);
  if (left === 0) return 'Open · closes today';
  if (left === 1) return 'Open · closes tomorrow';
  return `Open · closes in ${left} days`;
}

export const DURATION_PRESETS = [
  { id: '7', label: '1 week', days: 7 },
  { id: '14', label: '2 weeks', days: 14 },
  { id: '30', label: '1 month', days: 30 },
  { id: '90', label: '3 months', days: 90 },
  { id: 'custom', label: 'Until a specific date', days: null },
  { id: 'none', label: 'No end date', days: null },
] as const;

export type DurationId = (typeof DURATION_PRESETS)[number]['id'];

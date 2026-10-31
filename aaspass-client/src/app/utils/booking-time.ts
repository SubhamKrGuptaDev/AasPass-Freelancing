/** Pure time helpers for booking/availability. Times are 'HH:mm'; validation messages mirror the backend. */

export const MAX_RANGES_PER_DAY = 4;

/** Booking durations a customer may pick: multiples of the slot up to the max. */
export function durationOptions(slot: number, max: number): number[] {
  if (!Number.isFinite(slot) || slot <= 0 || !Number.isFinite(max)) {
    return [];
  }
  const out: number[] = [];
  for (let d = slot; d <= max; d += slot) {
    out.push(d);
  }
  return out;
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function minutesToTime(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function timeToMinutes(time: string): number {
  const [h, m] = (time ?? '').split(':');
  return Number(h) * 60 + Number(m);
}

export function timeOptions(stepMinutes = 15): string[] {
  const step = stepMinutes > 0 ? stepMinutes : 15;
  const out: string[] = [];
  for (let t = 0; t < 24 * 60; t += step) {
    out.push(minutesToTime(t));
  }
  return out;
}

/** Drops seconds from a backend 'HH:mm:ss' time. */
export function toHourMinute(time: string | null | undefined): string {
  return (time ?? '').slice(0, 5);
}

/** First error for one day's ranges (same messages as the backend), or null when valid. */
export function validateDayRanges(ranges: { start: string; end: string }[]): string | null {
  if (ranges.length > MAX_RANGES_PER_DAY) {
    return 'At most 4 time ranges per day';
  }
  const parsed = ranges.map(r => ({ s: timeToMinutes(r.start), e: timeToMinutes(r.end) }));
  if (parsed.some(r => !Number.isFinite(r.s) || !Number.isFinite(r.e) || r.s % 15 !== 0 || r.e % 15 !== 0)) {
    return 'Times must be on 15-minute boundaries';
  }
  if (parsed.some(r => r.e <= r.s)) {
    return 'End time must be after start time';
  }
  const sorted = [...parsed].sort((a, b) => a.s - b.s);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].s <= sorted[i - 1].e) {
      return 'Time ranges on the same day must not overlap';
    }
  }
  return null;
}

/** `days` consecutive local dates starting at `today`, as 'yyyy-MM-dd'. */
export function bookingDateStrip(today: Date, days = 31): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return out;
}

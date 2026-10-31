import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AvailabilityException, OwnerBookingRow, Schedule, ScheduleBooking, ScheduleDay } from '../../../models/booking.model';
import { OwnerBookingHttpService } from '../../../services/booking';
import {
  addDaysIso,
  formatDuration,
  minutesToTime,
  parseIsoDate,
  timeOfDay,
  timeToMinutes,
  toIsoDate,
  weekStartIso
} from '../../../utils/booking-time';
import { BookingDecisionPanelComponent } from '../booking-decision-panel/booking-decision-panel';
import { OwnerStoreSwitcherComponent } from '../owner-store-switcher';

const PX_PER_MINUTE = 0.8;
const DEFAULT_START = 9 * 60;
const DEFAULT_END = 18 * 60;

type ScheduleView = 'day' | 'week';

/** Rounds to one decimal so lane geometry reads cleanly ("33.3%"). */
function pct(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Owner schedule: day/week timeline where overlapping bookings sit side by side in lanes. */
@Component({
  selector: 'app-owner-schedule',
  imports: [RouterLink, HlmButtonImports, OwnerStoreSwitcherComponent, BookingDecisionPanelComponent],
  templateUrl: './owner-schedule.html'
})
export class OwnerScheduleComponent {
  private readonly http = inject(OwnerBookingHttpService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly formatDuration = formatDuration;

  readonly storeId = signal<string | undefined>(undefined);
  readonly view = signal<ScheduleView>('week');
  readonly schedule = signal<Schedule | null>(null);
  readonly state = signal<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  readonly selected = signal<ScheduleBooking | null>(null);

  private readonly queryDate = toSignal(this.route.queryParamMap.pipe(map(p => p.get('date'))), { initialValue: null });

  /** The anchor date ('yyyy-MM-dd'); `?date=` when valid, otherwise today. */
  readonly date = computed(() => {
    const q = this.queryDate();
    return parseIsoDate(q) ? (q as string) : toIsoDate(new Date());
  });
  readonly from = computed(() => (this.view() === 'week' ? weekStartIso(this.date()) : this.date()));
  readonly to = computed(() => (this.view() === 'week' ? addDaysIso(this.from(), 6) : this.from()));

  protected readonly days = computed<ScheduleDay[]>(() => this.schedule()?.days ?? []);

  /** Visible time axis in minutes: covers open hours and every booking, snapped to whole hours. */
  protected readonly axis = computed(() => {
    let start = Infinity;
    let end = -Infinity;
    for (const d of this.days()) {
      for (const r of d.openRanges) {
        start = Math.min(start, timeToMinutes(r.start));
        end = Math.max(end, timeToMinutes(r.end));
      }
      for (const b of d.bookings) {
        start = Math.min(start, this.startMinutes(b));
        end = Math.max(end, this.endMinutes(b));
      }
    }
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      start = DEFAULT_START;
      end = DEFAULT_END;
    }
    const s = Math.floor(start / 60) * 60;
    const e = Math.min(Math.ceil(end / 60) * 60, 24 * 60);
    return { start: s, end: Math.max(e, s + 60) };
  });
  protected readonly hours = computed(() => {
    const { start, end } = this.axis();
    const out: { label: string; top: number }[] = [];
    for (let t = start; t < end; t += 60) {
      out.push({ label: minutesToTime(t), top: (t - start) * PX_PER_MINUTE });
    }
    return out;
  });
  protected readonly gridHeight = computed(() => (this.axis().end - this.axis().start) * PX_PER_MINUTE);

  protected readonly selectedRow = computed<OwnerBookingRow | null>(() => {
    const s = this.selected();
    return s ? { booking: s.booking, overlapPendingCount: 0, overlapConfirmedCount: 0, outsideAvailability: false } : null;
  });

  private requestSeq = 0;

  constructor() {
    effect(() => {
      const id = this.storeId();
      const from = this.from();
      const to = this.to();
      if (id) {
        this.load(id, from, to);
      }
    });
  }

  protected reload(): void {
    const id = this.storeId();
    if (id) {
      this.load(id, this.from(), this.to());
    }
  }

  private load(storeId: string, from: string, to: string): void {
    const seq = ++this.requestSeq;
    this.state.set('loading');
    this.http.schedule(storeId, from, to).subscribe({
      next: s => {
        if (seq !== this.requestSeq) return;
        this.schedule.set(s);
        this.selected.set(null);
        this.state.set('loaded');
      },
      error: () => {
        if (seq !== this.requestSeq) return;
        this.state.set('failed');
      }
    });
  }

  protected setView(view: ScheduleView): void {
    this.view.set(view);
  }

  protected shift(direction: -1 | 1): void {
    this.goTo(addDaysIso(this.date(), direction * (this.view() === 'week' ? 7 : 1)));
  }

  protected today(): void {
    this.goTo(toIsoDate(new Date()));
  }

  private goTo(date: string): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { date }, queryParamsHandling: 'merge' });
  }

  protected startMinutes(b: ScheduleBooking): number {
    return timeToMinutes(timeOfDay(b.booking.startAt));
  }

  protected endMinutes(b: ScheduleBooking): number {
    const startDate = b.booking.startAt.slice(0, 10);
    // A booking ending on a later date is clipped to midnight.
    return b.booking.endAt.slice(0, 10) === startDate ? timeToMinutes(timeOfDay(b.booking.endAt)) : 24 * 60;
  }

  protected top(minutes: number): number {
    return Math.max(minutes - this.axis().start, 0) * PX_PER_MINUTE;
  }

  protected height(from: number, to: number): number {
    return Math.max(to - from, 15) * PX_PER_MINUTE;
  }

  protected blockStyle(b: ScheduleBooking, laneCount: number): Record<string, string> {
    const lanes = Math.max(laneCount, 1);
    const s = this.startMinutes(b);
    return {
      top: `${this.top(s)}px`,
      height: `${this.height(s, this.endMinutes(b))}px`,
      left: `${pct((b.lane / lanes) * 100)}%`,
      width: `${pct(100 / lanes)}%`
    };
  }

  protected bandStyle(start: string, end: string): Record<string, string> {
    const { start: axisStart, end: axisEnd } = this.axis();
    const s = Math.min(Math.max(timeToMinutes(start), axisStart), axisEnd);
    const e = Math.min(Math.max(timeToMinutes(end), s), axisEnd);
    return { top: `${(s - axisStart) * PX_PER_MINUTE}px`, height: `${(e - s) * PX_PER_MINUTE}px` };
  }

  /** BLOCKED exceptions to hatch; a blocked exception without times closes the whole day. */
  protected blocked(day: ScheduleDay): { style: Record<string, string>; reason: string }[] {
    return day.exceptions
      .filter((e: AvailabilityException) => e.type === 'BLOCKED')
      .map(e => ({
        style: this.bandStyle(e.start || minutesToTime(this.axis().start), e.end || minutesToTime(this.axis().end)),
        reason: e.reason || 'Blocked'
      }));
  }

  protected select(b: ScheduleBooking): void {
    this.selected.set(this.selected()?.booking.id === b.booking.id ? null : b);
  }

  protected dayLabel(date: string): string {
    const d = parseIsoDate(date);
    return d ? d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : date;
  }

  protected rangeLabel(): string {
    return this.from() === this.to() ? this.dayLabel(this.from()) : `${this.dayLabel(this.from())} - ${this.dayLabel(this.to())}`;
  }

  protected when(b: ScheduleBooking): string {
    return `${b.booking.startAt.replace('T', ' ').slice(0, 16)} · ${formatDuration(b.booking.durationMinutes)}`;
  }
}

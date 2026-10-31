import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Booking, DaySlots, SlotView } from '../../models/booking.model';
import { AuthService } from '../../services/auth/auth.service';
import { BookingHttpService, FunnelTrackingService } from '../../services/booking';
import { StoreService } from '../../services/store/store.service';
import { bookingDateStrip, formatDuration, minutesToTime, timeOfDay, timeToMinutes } from '../../utils/booking-time';

const NOTE_MAX = 500;

function positiveInt(raw: string | null | undefined): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Customer booking page: pick a date and one or more back-to-back slots, then send a request to the owner. */
@Component({
  selector: 'app-book-service',
  imports: [RouterLink, HlmButtonImports],
  templateUrl: './book-service.html'
})
export class BookServiceComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storeService = inject(StoreService);
  private readonly auth = inject(AuthService);
  private readonly http = inject(BookingHttpService);
  private readonly funnel = inject(FunnelTrackingService);

  protected readonly noteMax = NOTE_MAX;
  protected readonly formatDuration = formatDuration;
  protected readonly timeOfDay = timeOfDay;
  protected readonly dates = bookingDateStrip(new Date());

  private readonly storeKey = this.route.snapshot.paramMap.get('storeKey') ?? '';
  private readonly serviceId = this.route.snapshot.paramMap.get('serviceId') ?? '';

  readonly store = computed(() => this.storeService.getStoreByUrlKey(this.storeKey));
  readonly service = computed(() => this.store()?.services?.find(s => String(s.id) === this.serviceId));

  // Selection (start time + duration) mirrored to the query string so a login round trip restores it.
  readonly date = signal(this.initialDate());
  /** Selected slot start times, 'HH:mm', ascending and back-to-back. */
  readonly selected = signal<string[]>([]);
  // Read from the snapshot up front, so the early URL mirror clearing it is harmless.
  private restored: { time: string; duration: number | null } | null = this.restoredSelection();
  readonly note = signal('');

  readonly day = signal<DaySlots | null>(null);
  readonly loadingSlots = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectionHint = signal<string | null>(null);
  readonly booked = signal<Booking | null>(null);
  /** The caller's own PENDING requests at this store (empty when logged out). */
  readonly myPending = signal<Booking[]>([]);
  /** The caller's own CONFIRMED bookings at this store (empty when logged out). */
  readonly myConfirmed = signal<Booking[]>([]);

  /** Slot times on the selected date that overlap one of the caller's pending requests. */
  readonly myPendingTimes = computed(() => this.coveredTimes(this.myPending()));
  /** Slot times on the selected date that overlap one of the caller's confirmed bookings. */
  readonly myConfirmedTimes = computed(() => this.coveredTimes(this.myConfirmed()));

  /** First selected slot, or '' when nothing is selected. */
  readonly time = computed(() => this.selected()[0] ?? '');
  /** Total booking length in minutes, or null when nothing is selected. */
  readonly duration = computed(() => {
    const count = this.selected().length;
    const slot = this.day()?.slotMinutes ?? 0;
    return count > 0 && slot > 0 ? count * slot : null;
  });
  /** Service price is an hourly rate, charged pro rata for the selected minutes (mirrors BookingService.totalPrice). */
  readonly amount = computed(() => {
    const price = Number(this.service()?.price);
    const duration = this.duration();
    return duration && Number.isFinite(price) ? Math.round(price * duration / 60 * 100) / 100 : null;
  });
  /** Hourly rate as shown next to the total, or null when the service has no usable price. */
  readonly hourlyRate = computed(() => {
    const price = Number(this.service()?.price);
    return Number.isFinite(price) ? price : null;
  });
  readonly endTime = computed(() => {
    const duration = this.duration();
    return this.time() && duration ? minutesToTime(timeToMinutes(this.time()) + duration) : '';
  });
  /** Most slots one booking may cover; at least one so a store with a bad max can still be booked. */
  readonly maxSlots = computed(() => {
    const d = this.day();
    return d && d.slotMinutes > 0 ? Math.max(1, Math.floor(d.maxBookingMinutes / d.slotMinutes)) : 1;
  });

  private slotRequest = 0;

  constructor() {
    let pageViewTracked = false;
    effect(() => {
      const store = this.store();
      if (store?.id && !pageViewTracked) {
        pageViewTracked = true;
        untracked(() => this.funnel.track(String(store.id), 'BOOKING_PAGE_VIEW', this.serviceId));
      }
    });

    effect(() => {
      const store = this.store();
      const date = this.date();
      if (store?.id) {
        untracked(() => this.loadSlots(String(store.id), date));
      }
    });

    effect(() => {
      const store = this.store();
      if (store?.id && this.auth.isLoggedIn()) {
        untracked(() => this.loadMyBookings(String(store.id)));
      } else {
        untracked(() => {
          this.myPending.set([]);
          this.myConfirmed.set([]);
        });
      }
    });

    effect(() => {
      const duration = this.duration();
      const query = { date: this.date(), duration: duration ? String(duration) : null, time: this.time() || null };
      untracked(() => this.mirrorToUrl(query));
    });
  }

  /** '700' for whole rupees, '262.50' otherwise. */
  formatAmount(value: number | string | null | undefined): string {
    const n = Number(value);
    if (value === null || value === undefined || !Number.isFinite(n)) return '';
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
  }

  /** Own pending slots are not startable: the server rejects a second request from the same user at that time. */
  isStartable(slot: SlotView): boolean {
    const selectable = slot.status === 'FREE' || slot.status === 'REQUESTED';
    return selectable && !this.isMyPending(slot) && (this.day()?.startTimes ?? []).includes(slot.time);
  }

  isSelected(slot: SlotView): boolean {
    return this.selected().includes(slot.time);
  }

  isMyPending(slot: SlotView): boolean {
    return this.myPendingTimes().has(slot.time);
  }

  /** A BOOKED slot held by the caller's own confirmed booking. */
  isMyBooked(slot: SlotView): boolean {
    return slot.status === 'BOOKED' && this.myConfirmedTimes().has(slot.time);
  }

  /** Classes for a slot button; the caller's own slots get their own look instead of the generic disabled grey. */
  slotClasses(slot: SlotView): string {
    if (this.isMyBooked(slot)) {
      return 'cursor-not-allowed border-emerald-400 bg-emerald-50 text-emerald-900';
    }
    if (this.isMyPending(slot)) {
      return 'cursor-not-allowed border-amber-300 bg-amber-50 text-amber-900';
    }
    if (this.isSelected(slot)) {
      return 'border-indigo-600 bg-indigo-50';
    }
    return 'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400';
  }

  /** Other customers' pending requests; the caller's own request is counted in pendingCount too, so it is left out. */
  othersLabel(slot: SlotView): string {
    const n = Math.max(0, (slot.pendingCount ?? 0) - (this.isMyPending(slot) ? 1 : 0));
    return n > 0 ? `${n} other${n === 1 ? '' : 's'} requested` : '';
  }

  pickDate(date: string): void {
    this.date.set(date);
    this.clearSelection();
  }

  /**
   * Toggles a slot. Clicking an end of the selection removes it, clicking inside trims the selection to end there,
   * and clicking outside extends it when every slot in between is free and the max length allows; otherwise the
   * clicked slot starts a new selection.
   */
  pickTime(slot: SlotView): void {
    const slots = this.day()?.slots ?? [];
    const idx = slots.findIndex(s => s.time === slot.time);
    if (idx < 0 || !this.isStartable(slots[idx])) {
      return;
    }
    this.errorMessage.set(null);
    this.selectionHint.set(null);
    const current = this.selectedRange(slots);
    if (!current) {
      this.select(slots, idx, idx);
      this.trackSlotSelected();
      return;
    }
    const [a, b] = current;
    if (idx >= a && idx <= b) {
      if (a === b) {
        this.clearSelection();
      } else if (idx === a) {
        this.select(slots, a + 1, b);
      } else {
        this.select(slots, a, idx === b ? b - 1 : idx);
      }
      return;
    }
    const lo = Math.min(a, idx);
    const hi = Math.max(b, idx);
    if (this.isValidRun(slots, lo, hi)) {
      this.select(slots, lo, hi);
    } else {
      this.selectionHint.set(hi - lo + 1 > this.maxSlots()
        ? `One booking can be at most ${formatDuration(this.maxSlots() * (this.day()?.slotMinutes ?? 0))}, so a new selection was started.`
        : 'Slots must be back-to-back with no booked or closed time in between, so a new selection was started.');
      this.select(slots, idx, idx);
    }
    this.trackSlotSelected();
  }

  clearSelection(): void {
    this.selected.set([]);
    this.selectionHint.set(null);
  }

  submit(): void {
    const store = this.store();
    const service = this.service();
    const time = this.time();
    const duration = this.duration();
    if (!store || !service || !time || !duration || this.submitting()) {
      return;
    }
    if (!this.auth.isLoggedIn()) {
      this.auth.openLoginModal(this.router.url);
      return;
    }
    const storeId = positiveInt(String(store.id));
    const serviceId = positiveInt(String(service.id));
    if (!storeId || !serviceId) {
      this.errorMessage.set('This service cannot be booked right now.');
      return;
    }
    const note = this.note().trim();
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.http
      .create(
        {
          storeId,
          serviceId,
          startAt: `${this.date()}T${time}:00`,
          durationMinutes: duration,
          visitorId: this.funnel.visitorId(),
          ...(note ? { note } : {})
        },
        true
      )
      .subscribe({
        next: booking => {
          this.submitting.set(false);
          this.booked.set(booking);
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          this.errorMessage.set(this.messageFrom(err));
          this.clearSelection();
          this.loadSlots(String(store.id), this.date());
        }
      });
  }

  /** Best effort: without it the server still rejects a duplicate request, just later. */
  private loadMyBookings(storeId: string): void {
    const atStore = (content: Booking[] | null | undefined) => (content ?? []).filter(b => String(b.storeId) === storeId);
    this.http.mine('PENDING', 0, 100, true).subscribe({
      next: page => this.myPending.set(atStore(page?.content)),
      error: () => this.myPending.set([])
    });
    this.http.mine('CONFIRMED', 0, 100, true).subscribe({
      next: page => this.myConfirmed.set(atStore(page?.content)),
      error: () => this.myConfirmed.set([])
    });
  }

  /** Slot times on the selected date that overlap any of `bookings`. */
  private coveredTimes(bookings: Booking[]): Set<string> {
    const d = this.day();
    const date = this.date();
    const onDate = bookings.filter(b => b.startAt?.slice(0, 10) === date);
    if (!d || d.slotMinutes <= 0 || onDate.length === 0) {
      return new Set<string>();
    }
    const ranges = onDate.map(b => [timeToMinutes(timeOfDay(b.startAt)), timeToMinutes(timeOfDay(b.endAt))]);
    return new Set(d.slots
      .filter(s => {
        const start = timeToMinutes(s.time);
        return ranges.some(([bs, be]) => bs < start + d.slotMinutes && be > start);
      })
      .map(s => s.time));
  }

  private trackSlotSelected(): void {
    const store = this.store();
    if (store?.id) {
      this.funnel.track(String(store.id), 'SLOT_SELECTED', this.serviceId);
    }
  }

  private select(slots: SlotView[], lo: number, hi: number): void {
    this.selected.set(slots.slice(lo, hi + 1).map(s => s.time));
  }

  /** Index range of the current selection in `slots`, or null when empty or no longer a valid run. */
  private selectedRange(slots: SlotView[]): [number, number] | null {
    const sel = this.selected();
    if (sel.length === 0) return null;
    const a = slots.findIndex(s => s.time === sel[0]);
    const b = a + sel.length - 1;
    const matches = a >= 0 && b < slots.length && sel.every((t, i) => slots[a + i]?.time === t);
    return matches && this.isValidRun(slots, a, b) ? [a, b] : null;
  }

  /** True when slots lo..hi are all startable, contiguous in time and within the store's max booking length. */
  private isValidRun(slots: SlotView[], lo: number, hi: number): boolean {
    const step = this.day()?.slotMinutes ?? 0;
    if (lo < 0 || hi >= slots.length || hi < lo || step <= 0 || hi - lo + 1 > this.maxSlots()) {
      return false;
    }
    for (let i = lo; i <= hi; i++) {
      if (!this.isStartable(slots[i])) return false;
      if (i > lo && timeToMinutes(slots[i].time) - timeToMinutes(slots[i - 1].time) !== step) return false;
    }
    return true;
  }

  private messageFrom(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body: unknown = err.error;
      const message = body && typeof body === 'object' ? (body as { message?: unknown }).message : null;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
      if (err.status === 0) {
        return "Can't reach AasPass right now. Check your connection.";
      }
    }
    return 'Something went wrong. Please try again.';
  }

  private initialDate(): string {
    const requested = this.route.snapshot.queryParamMap.get('date');
    return requested && this.dates.includes(requested) ? requested : this.dates[0];
  }

  private restoredSelection(): { time: string; duration: number | null } | null {
    const query = this.route.snapshot.queryParamMap;
    const time = query.get('time');
    return time ? { time, duration: positiveInt(query.get('duration')) } : null;
  }

  /** Slots are always fetched at the slot length, so `startTimes` lists every individually bookable slot. */
  private loadSlots(storeId: string, date: string): void {
    const request = ++this.slotRequest;
    this.loadingSlots.set(true);
    this.http.slots(storeId, date, null).subscribe({
      next: day => {
        if (request !== this.slotRequest) return;
        this.loadingSlots.set(false);
        this.errorMessage.set(null);
        this.day.set(day);
        const restored = this.restored;
        if (restored) {
          this.restored = null;
          this.applyRestored(day, restored);
        } else if (this.selected().length > 0 && !this.selectedRange(day.slots)) {
          this.clearSelection();
        }
      },
      error: (err: unknown) => {
        if (request !== this.slotRequest) return;
        this.loadingSlots.set(false);
        this.day.set(null);
        this.errorMessage.set(this.messageFrom(err));
      }
    });
  }

  /** Re-selects the run from the URL; drops it when it no longer fits, keeping only the start slot if that is free. */
  private applyRestored(day: DaySlots, restored: { time: string; duration: number | null }): void {
    const start = day.slots.findIndex(s => s.time === restored.time);
    if (start < 0 || day.slotMinutes <= 0) {
      this.selected.set([]);
      return;
    }
    const wanted = restored.duration && restored.duration % day.slotMinutes === 0
      ? restored.duration / day.slotMinutes : 1;
    const end = start + wanted - 1;
    if (this.isValidRun(day.slots, start, end)) {
      this.select(day.slots, start, end);
    } else if (this.isValidRun(day.slots, start, start)) {
      this.select(day.slots, start, start);
    } else {
      this.selected.set([]);
    }
  }

  private mirrorToUrl(query: { date: string; duration: string | null; time: string | null }): void {
    const tree = this.router.parseUrl(this.router.url);
    tree.queryParams = { ...tree.queryParams, ...query };
    this.router.navigateByUrl(tree, { replaceUrl: true }).catch(() => undefined);
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Booking, DaySlots, SlotView } from '../../models/booking.model';
import { AuthService } from '../../services/auth/auth.service';
import { BookingHttpService, FunnelTrackingService } from '../../services/booking';
import { StoreService } from '../../services/store/store.service';
import { bookingDateStrip, durationOptions, formatDuration } from '../../utils/booking-time';

const NOTE_MAX = 500;

function positiveInt(raw: string | null | undefined): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Customer booking page: pick date, duration and start time, then send a request to the owner. */
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
  protected readonly dates = bookingDateStrip(new Date());

  private readonly storeKey = this.route.snapshot.paramMap.get('storeKey') ?? '';
  private readonly serviceId = this.route.snapshot.paramMap.get('serviceId') ?? '';

  readonly store = computed(() => this.storeService.getStoreByUrlKey(this.storeKey));
  readonly service = computed(() => this.store()?.services?.find(s => String(s.id) === this.serviceId));

  // Selection mirrored to the query string so a login round trip restores it.
  readonly date = signal(this.initialDate());
  // Unknown (null) until the first slots response tells us which durations the store allows.
  readonly duration = signal<number | null>(null);
  private restoredDuration: number | null = positiveInt(this.route.snapshot.queryParamMap.get('duration'));
  private durationResolved = false;
  readonly time = signal(this.route.snapshot.queryParamMap.get('time') ?? '');
  readonly note = signal('');

  readonly day = signal<DaySlots | null>(null);
  readonly loadingSlots = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly booked = signal<Booking | null>(null);

  readonly durations = computed(() => {
    const d = this.day();
    return d ? this.allowedDurations(d) : [];
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
      const duration = this.duration();
      if (store?.id) {
        untracked(() => this.loadSlots(String(store.id), date, duration));
      }
    });

    effect(() => {
      const duration = this.duration();
      const query = { date: this.date(), duration: duration ? String(duration) : null, time: this.time() || null };
      untracked(() => this.mirrorToUrl(query));
    });
  }

  isStartable(slot: SlotView): boolean {
    const selectable = slot.status === 'FREE' || slot.status === 'REQUESTED';
    return selectable && (this.day()?.startTimes ?? []).includes(slot.time);
  }

  othersLabel(slot: SlotView): string {
    const n = slot.pendingCount ?? 0;
    return n > 0 ? `${n} other${n === 1 ? '' : 's'} requested` : '';
  }

  pickDate(date: string): void {
    this.date.set(date);
    this.time.set('');
  }

  pickDuration(value: string | number): void {
    const n = positiveInt(String(value));
    if (n) {
      this.duration.set(n);
      this.time.set('');
    }
  }

  pickTime(slot: SlotView): void {
    if (this.isStartable(slot)) {
      this.time.set(slot.time);
      this.errorMessage.set(null);
      const store = this.store();
      if (store?.id) {
        this.funnel.track(String(store.id), 'SLOT_SELECTED', this.serviceId);
      }
    }
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
          this.time.set('');
          this.loadSlots(String(store.id), this.date(), this.duration());
        }
      });
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

  private allowedDurations(d: DaySlots): number[] {
    const options = durationOptions(d.slotMinutes, d.maxBookingMinutes);
    return options.length > 0 ? options : d.slotMinutes > 0 ? [d.slotMinutes] : [];
  }

  /** `duration` null means "let the server default to the slot length". */
  private loadSlots(storeId: string, date: string, duration: number | null): void {
    const request = ++this.slotRequest;
    this.loadingSlots.set(true);
    this.http.slots(storeId, date, duration).subscribe({
      next: day => {
        if (request !== this.slotRequest) return;
        this.loadingSlots.set(false);
        this.errorMessage.set(null);
        this.day.set(day);
        const options = this.allowedDurations(day);
        const current = this.duration();
        if (!this.durationResolved) {
          // First response: settle on a duration this store allows (restored one if valid), keep the restored time.
          this.durationResolved = true;
          const wanted = this.restoredDuration ?? current;
          const chosen = wanted !== null && options.includes(wanted) ? wanted : (options[0] ?? day.slotMinutes);
          if (chosen !== current) {
            this.duration.set(chosen);
          }
          return;
        }
        if (current !== null && options.length > 0 && !options.includes(current)) {
          this.duration.set(options[0]);
          return;
        }
        if (this.time() && !day.startTimes.includes(this.time())) {
          this.time.set('');
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

  private mirrorToUrl(query: { date: string; duration: string | null; time: string | null }): void {
    const tree = this.router.parseUrl(this.router.url);
    tree.queryParams = { ...tree.queryParams, ...query };
    this.router.navigateByUrl(tree, { replaceUrl: true }).catch(() => undefined);
  }
}

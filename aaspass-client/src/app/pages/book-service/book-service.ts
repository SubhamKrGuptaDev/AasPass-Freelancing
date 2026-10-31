import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Booking, DaySlots, SlotView } from '../../models/booking.model';
import { AuthService } from '../../services/auth/auth.service';
import { BookingHttpService } from '../../services/booking';
import { StoreService } from '../../services/store/store.service';
import { bookingDateStrip, durationOptions, formatDuration } from '../../utils/booking-time';

const NOTE_MAX = 500;
const DEFAULT_DURATION = 60;

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

  protected readonly noteMax = NOTE_MAX;
  protected readonly formatDuration = formatDuration;
  protected readonly dates = bookingDateStrip(new Date());

  private readonly storeKey = this.route.snapshot.paramMap.get('storeKey') ?? '';
  private readonly serviceId = this.route.snapshot.paramMap.get('serviceId') ?? '';

  readonly store = computed(() => this.storeService.getStoreByUrlKey(this.storeKey));
  readonly service = computed(() => this.store()?.services?.find(s => String(s.id) === this.serviceId));

  // Selection mirrored to the query string so a login round trip restores it.
  readonly date = signal(this.route.snapshot.queryParamMap.get('date') ?? this.dates[0]);
  readonly duration = signal(positiveInt(this.route.snapshot.queryParamMap.get('duration')) ?? DEFAULT_DURATION);
  readonly time = signal(this.route.snapshot.queryParamMap.get('time') ?? '');
  readonly note = signal('');

  readonly day = signal<DaySlots | null>(null);
  readonly loadingSlots = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly booked = signal<Booking | null>(null);

  readonly durations = computed(() => {
    const d = this.day();
    const options = durationOptions(d?.slotMinutes ?? 30, d?.maxBookingMinutes ?? 120);
    return options.includes(this.duration()) ? options : [...options, this.duration()].sort((a, b) => a - b);
  });

  private slotRequest = 0;

  constructor() {
    effect(() => {
      const store = this.store();
      const date = this.date();
      const duration = this.duration();
      if (store?.id) {
        untracked(() => this.loadSlots(String(store.id), date, duration));
      }
    });

    effect(() => {
      const query = { date: this.date(), duration: String(this.duration()), time: this.time() || null };
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
    }
  }

  submit(): void {
    const store = this.store();
    const service = this.service();
    const time = this.time();
    if (!store || !service || !time || this.submitting()) {
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
          durationMinutes: this.duration(),
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

  private loadSlots(storeId: string, date: string, duration: number): void {
    const request = ++this.slotRequest;
    this.loadingSlots.set(true);
    this.http.slots(storeId, date, duration).subscribe({
      next: day => {
        if (request !== this.slotRequest) return;
        this.loadingSlots.set(false);
        this.day.set(day);
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

  private mirrorToUrl(query: { date: string; duration: string; time: string | null }): void {
    const tree = this.router.parseUrl(this.router.url);
    tree.queryParams = { ...tree.queryParams, ...query };
    this.router.navigateByUrl(tree, { replaceUrl: true }).catch(() => undefined);
  }
}

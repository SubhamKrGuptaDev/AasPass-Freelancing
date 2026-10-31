import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Booking, BookingStatus } from '../../models/booking.model';
import { BookingHttpService } from '../../services/booking';
import { ToastService } from '../../services/toast/toast.service';
import { formatDuration } from '../../utils/booking-time';

const CANCELLABLE: readonly BookingStatus[] = ['PENDING', 'CONFIRMED'];

/** The signed-in customer's booking requests with status and cancel. */
@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink, HlmButtonImports],
  templateUrl: './my-bookings.html'
})
export class MyBookingsComponent {
  private readonly http = inject(BookingHttpService);
  private readonly toast = inject(ToastService);

  protected readonly formatDuration = formatDuration;

  readonly bookings = signal<Booking[]>([]);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly state = signal<'loading' | 'loaded' | 'failed'>('loading');
  readonly cancelling = signal<number | null>(null);

  constructor() {
    this.load(0);
  }

  canCancel(b: Booking): boolean {
    return CANCELLABLE.includes(b.status);
  }

  load(page: number): void {
    this.state.set('loading');
    this.http.mine(undefined, page).subscribe({
      next: res => {
        this.bookings.set(res?.content ?? []);
        this.page.set(res?.page ?? page);
        this.totalPages.set(res?.totalPages ?? 0);
        this.state.set('loaded');
      },
      error: () => this.state.set('failed')
    });
  }

  cancel(b: Booking): void {
    if (this.cancelling() !== null || !this.canCancel(b)) {
      return;
    }
    this.cancelling.set(b.id);
    this.http.cancel(b.id).subscribe({
      next: updated => {
        this.cancelling.set(null);
        this.bookings.update(list => list.map(x => (x.id === updated.id ? updated : x)));
        this.toast.success('Booking cancelled.');
      },
      error: () => this.cancelling.set(null)
    });
  }
}

import { Component, computed, inject, input, output, signal } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { Booking, BookingAction, ConfirmPreview, OwnerBookingRow } from '../../../models/booking.model';
import { OwnerBookingHttpService } from '../../../services/booking';
import { ToastService } from '../../../services/toast/toast.service';
import { formatDuration } from '../../../utils/booking-time';

/**
 * Confirm / reject / complete actions for one owner booking. Confirm loads the preview first: when it would
 * auto-reject other requests the owner must click a second time; when a confirmed booking blocks it, Confirm is disabled.
 */
@Component({
  selector: 'app-booking-decision-panel',
  imports: [HlmButtonImports, HlmTextareaImports],
  templateUrl: './booking-decision-panel.html'
})
export class BookingDecisionPanelComponent {
  private readonly http = inject(OwnerBookingHttpService);
  private readonly toast = inject(ToastService);

  readonly booking = input.required<OwnerBookingRow>();
  readonly decided = output<void>();

  protected readonly formatDuration = formatDuration;
  protected readonly preview = signal<ConfirmPreview | null>(null);
  protected readonly busy = signal(false);
  protected readonly note = signal('');

  protected readonly status = computed(() => this.booking()?.booking?.status);
  protected readonly isPending = computed(() => this.status() === 'PENDING');
  /** Only started bookings can be completed (the server enforces the same rule). */
  protected readonly canComplete = computed(() => {
    const b = this.booking()?.booking;
    return b?.status === 'CONFIRMED' && new Date(b.startAt).getTime() <= Date.now();
  });
  protected readonly autoRejectCount = computed(() => this.preview()?.willAutoReject?.length ?? 0);
  protected readonly blocked = computed(() => this.preview()?.canConfirm === false);

  protected label(b: Booking): string {
    return `${b.userName} · ${b.startAt.replace('T', ' ').slice(0, 16)} · ${formatDuration(b.durationMinutes)}`;
  }

  protected onNote(event: Event): void {
    this.note.set((event.target as HTMLTextAreaElement).value);
  }

  protected confirm(): void {
    const b = this.booking()?.booking;
    if (!b || this.busy() || this.blocked()) return;
    // Second click after the auto-reject warning.
    if (this.preview()) {
      this.submit('CONFIRM');
      return;
    }
    this.busy.set(true);
    this.http.preview(b.storeId, b.id).subscribe({
      next: p => {
        this.preview.set(p);
        this.busy.set(false);
        if (p.canConfirm && (p.willAutoReject?.length ?? 0) === 0) {
          this.submit('CONFIRM');
        }
      },
      error: () => {
        // Typically "Booking is no longer pending" (toasted by the interceptor): refresh the list.
        this.busy.set(false);
        this.decided.emit();
      }
    });
  }

  protected reject(): void {
    this.submit('REJECT', this.note());
  }

  protected complete(): void {
    this.submit('COMPLETE');
  }

  private submit(action: BookingAction, ownerNote?: string): void {
    const b = this.booking()?.booking;
    if (!b || this.busy()) return;
    this.busy.set(true);
    this.http.decide(b.id, action, ownerNote).subscribe({
      next: result => {
        this.busy.set(false);
        this.preview.set(null);
        this.note.set('');
        if (action === 'CONFIRM') {
          const n = result.autoRejectedCount;
          this.toast.success(n > 0 ? `Booking confirmed. ${n} overlapping request(s) auto-rejected.` : 'Booking confirmed.');
        } else if (action === 'REJECT') {
          this.toast.success('Booking rejected.');
        } else {
          this.toast.success('Booking marked complete.');
        }
        this.decided.emit();
      },
      error: () => {
        // 409/400 messages are toasted by the error interceptor; refresh so the list reflects the server state.
        this.busy.set(false);
        this.preview.set(null);
        this.decided.emit();
      }
    });
  }
}

import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { AvailabilityEditorComponent } from '../../../components/availability-editor/availability-editor';
import {
  AvailabilityException,
  AvailabilityExceptionRequest,
  AvailabilityExceptionType,
  DEFAULT_AVAILABILITY,
  StoreAvailability
} from '../../../models/booking.model';
import { AvailabilityHttpService } from '../../../services/booking';
import { StoreService } from '../../../services/store/store.service';
import { ToastService } from '../../../services/toast/toast.service';
import { timeOptions, timeToMinutes } from '../../../utils/booking-time';
import { OwnerStoreSwitcherComponent } from '../owner-store-switcher';

const REASON_MAX = 200;

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function outsideMessage(count: number): string {
  return `${count} confirmed booking${count === 1 ? ' is' : 's are'} now outside your hours`;
}

/** Owner page: weekly hours (shared editor) and per-date overrides for one owned store. */
@Component({
  selector: 'app-owner-availability',
  imports: [ReactiveFormsModule, HlmButtonImports, HlmInputImports, HlmTabsImports, AvailabilityEditorComponent, OwnerStoreSwitcherComponent],
  templateUrl: './owner-availability.html'
})
export class OwnerAvailabilityComponent {
  private readonly http = inject(AvailabilityHttpService);
  private readonly toast = inject(ToastService);
  private readonly storeService = inject(StoreService);

  protected readonly times = timeOptions();
  protected readonly reasonMax = REASON_MAX;
  protected readonly minDate = todayIso();

  readonly storeId = signal<string | undefined>(undefined);

  /** Weekly editor control; disabled while loading and after a failed load so defaults never overwrite real hours. */
  readonly availability = new FormControl<StoreAvailability>(DEFAULT_AVAILABILITY, { nonNullable: true });
  readonly loadState = signal<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  readonly saving = signal(false);

  readonly exceptions = signal<AvailabilityException[]>([]);
  readonly exceptionsState = signal<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  readonly addingException = signal(false);

  readonly exceptionForm = new FormGroup({
    date: new FormControl('', { nonNullable: true }),
    type: new FormControl<AvailabilityExceptionType>('BLOCKED', { nonNullable: true }),
    wholeDay: new FormControl(true, { nonNullable: true }),
    start: new FormControl('09:00', { nonNullable: true }),
    end: new FormControl('18:00', { nonNullable: true }),
    reason: new FormControl('', { nonNullable: true })
  });
  protected readonly exceptionError = signal<string | null>(null);
  private readonly formType = signal<AvailabilityExceptionType>('BLOCKED');
  private readonly formWholeDay = signal(true);
  /** Time pickers show for OPEN (always) and BLOCKED when not the whole day. */
  protected readonly showTimes = computed(() => this.formType() === 'OPEN' || !this.formWholeDay());

  constructor() {
    this.exceptionForm.controls.type.valueChanges.subscribe(v => this.formType.set(v));
    this.exceptionForm.controls.wholeDay.valueChanges.subscribe(v => this.formWholeDay.set(v));
    effect(() => {
      const id = this.storeId();
      if (id) {
        this.load(id);
      }
    });
  }

  protected reload(): void {
    const id = this.storeId();
    if (id) {
      this.load(id);
    }
  }

  private load(storeId: string): void {
    const control = this.availability;
    this.loadState.set('loading');
    control.disable({ emitEvent: false });
    this.http.get(storeId).subscribe({
      next: a => {
        if (this.storeId() !== storeId) return;
        control.setValue(a);
        control.enable({ emitEvent: false });
        this.loadState.set('loaded');
      },
      error: () => {
        if (this.storeId() !== storeId) return;
        this.loadState.set('failed');
        this.toast.error('Could not load your availability. Your saved hours will be left unchanged.');
      }
    });
    this.loadExceptions(storeId);
  }

  private loadExceptions(storeId: string): void {
    this.exceptionsState.set('loading');
    this.exceptions.set([]);
    this.http.listExceptions(storeId, todayIso()).subscribe({
      next: list => {
        if (this.storeId() !== storeId) return;
        this.exceptions.set(list ?? []);
        this.exceptionsState.set('loaded');
      },
      error: () => {
        if (this.storeId() !== storeId) return;
        this.exceptionsState.set('failed');
      }
    });
  }

  saveWeekly(): void {
    const storeId = this.storeId();
    if (!storeId || this.saving() || this.loadState() !== 'loaded') {
      return;
    }
    if (this.availability.invalid) {
      this.availability.markAsTouched();
      this.toast.error('Please fix the availability errors before saving.');
      return;
    }
    this.saving.set(true);
    this.http.save(storeId, this.availability.getRawValue()).subscribe({
      next: result => {
        this.saving.set(false);
        if (this.storeId() !== storeId) return;
        this.availability.setValue(result.availability);
        this.storeService.setBookingsOpen(storeId, (result.availability?.ranges ?? []).length > 0);
        this.toast.success('Weekly hours saved.');
        if (result.confirmedOutsideCount > 0) {
          this.toast.warning(outsideMessage(result.confirmedOutsideCount));
        }
      },
      error: () => this.saving.set(false) // HTTP errors are toasted by the interceptor
    });
  }

  addException(): void {
    const storeId = this.storeId();
    if (!storeId || this.addingException()) {
      return;
    }
    const v = this.exceptionForm.getRawValue();
    const error = this.validateException(v);
    this.exceptionError.set(error);
    if (error) {
      return;
    }
    const req: AvailabilityExceptionRequest = { date: v.date, type: v.type };
    if (this.showTimes()) {
      req.start = v.start;
      req.end = v.end;
    }
    if (v.reason.trim()) {
      req.reason = v.reason.trim();
    }
    this.addingException.set(true);
    this.http.addException(storeId, req).subscribe({
      next: created => {
        this.addingException.set(false);
        if (this.storeId() !== storeId) return;
        this.exceptions.update(list => [...list, created].sort((a, b) => a.date.localeCompare(b.date)));
        this.exceptionForm.patchValue({ date: '', reason: '' });
        this.toast.success('Date override added.');
        if ((created?.confirmedOutsideCount ?? 0) > 0) {
          this.toast.warning(outsideMessage(created.confirmedOutsideCount));
        }
      },
      error: () => this.addingException.set(false)
    });
  }

  private validateException(v: { date: string; start: string; end: string; reason: string }): string | null {
    if (!v.date) return 'Pick a date.';
    if (v.date < this.minDate) return 'The date must be today or later.';
    if (v.reason.length > REASON_MAX) return `Reason must be at most ${REASON_MAX} characters.`;
    if (this.showTimes() && timeToMinutes(v.end) <= timeToMinutes(v.start)) return 'End time must be after start time.';
    return null;
  }

  deleteException(exception: AvailabilityException): void {
    const storeId = this.storeId();
    if (!storeId) return;
    this.http.deleteException(storeId, exception.id).subscribe({
      next: () => {
        if (this.storeId() !== storeId) return;
        this.exceptions.update(list => list.filter(e => e.id !== exception.id));
      }
    });
  }

  protected describe(e: AvailabilityException): string {
    if (e.type === 'BLOCKED') {
      return e.start && e.end ? `Closed ${e.start} - ${e.end}` : 'Closed all day';
    }
    return `Open ${e.start ?? ''} - ${e.end ?? ''}`;
  }
}

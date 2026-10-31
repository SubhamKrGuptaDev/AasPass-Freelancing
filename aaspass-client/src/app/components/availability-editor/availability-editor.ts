import { Component, computed, forwardRef, signal } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import {
  AvailabilityRange,
  DAYS_OF_WEEK,
  DEFAULT_AVAILABILITY,
  DayOfWeek,
  SLOT_OPTIONS,
  StoreAvailability
} from '../../models/booking.model';
import {
  durationOptions,
  formatDuration,
  MAX_RANGES_PER_DAY,
  minutesToTime,
  timeOptions,
  timeToMinutes,
  validateDayRanges
} from '../../utils/booking-time';

const MAX_BOOKING_CAP = 720;
const NEW_RANGE = { start: '09:00', end: '18:00' } as const;

interface DayView {
  day: DayOfWeek;
  label: string;
  open: boolean;
  ranges: { index: number; start: string; end: string }[];
  error: string | null;
}

/** Max booking length after the slot changes: keep it when still valid, else the default (about 2 h). */
function clampMax(slot: number, max: number): number {
  const valid = Number.isFinite(max) && max >= slot && max <= MAX_BOOKING_CAP && max % slot === 0;
  return valid ? max : Math.max(Math.floor(120 / slot) * slot, slot);
}

/**
 * Weekly availability editor: per-weekday open toggle with up to four time ranges, slot length and
 * longest booking. `ControlValueAccessor` + `Validator` over `StoreAvailability`.
 */
@Component({
  selector: 'app-availability-editor',
  imports: [HlmSwitchImports],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AvailabilityEditorComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => AvailabilityEditorComponent), multi: true }
  ],
  host: { class: 'block' },
  templateUrl: './availability-editor.html'
})
export class AvailabilityEditorComponent implements ControlValueAccessor, Validator {
  protected readonly slotOptions = SLOT_OPTIONS;
  protected readonly times = timeOptions();
  protected readonly formatDuration = formatDuration;
  protected readonly maxRanges = MAX_RANGES_PER_DAY;

  protected readonly value = signal<StoreAvailability>(DEFAULT_AVAILABILITY);
  protected readonly disabled = signal(false);

  protected readonly maxOptions = computed(() => durationOptions(this.value().slotMinutes, MAX_BOOKING_CAP));

  protected readonly days = computed<DayView[]>(() => {
    const ranges = this.value().ranges;
    return DAYS_OF_WEEK.map(day => {
      const mine = ranges
        .map((r, index) => ({ r, index }))
        .filter(x => x.r.day === day)
        .map(x => ({ index: x.index, start: x.r.start, end: x.r.end }));
      return {
        day,
        label: day.charAt(0) + day.slice(1).toLowerCase(),
        open: mine.length > 0,
        ranges: mine,
        error: validateDayRanges(mine)
      };
    });
  });

  private onChange: (value: StoreAvailability) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: StoreAvailability | null): void {
    this.value.set(value ? { ...value, ranges: [...(value.ranges ?? [])] } : DEFAULT_AVAILABILITY);
  }

  registerOnChange(fn: (value: StoreAvailability) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    const error = this.days().find(d => d.error)?.error;
    return error ? { availability: error } : null;
  }

  private update(next: StoreAvailability): void {
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
  }

  private withRanges(ranges: AvailabilityRange[]): void {
    this.update({ ...this.value(), ranges });
  }

  protected toggleDay(day: DayOfWeek, open: boolean): void {
    const others = this.value().ranges.filter(r => r.day !== day);
    this.withRanges(open ? [...others, { day, ...NEW_RANGE }] : others);
  }

  protected addRange(day: DayOfWeek): void {
    const mine = this.value().ranges.filter(r => r.day === day);
    if (mine.length >= MAX_RANGES_PER_DAY) {
      return;
    }
    // Start the new range after the latest end so it does not overlap by default.
    const lastEnd = Math.max(...mine.map(r => timeToMinutes(r.end)), 0);
    const startMin = Math.min(lastEnd + 60, 23 * 60);
    const endMin = Math.min(startMin + 60, 23 * 60 + 45);
    this.withRanges([...this.value().ranges, { day, start: minutesToTime(startMin), end: minutesToTime(endMin) }]);
  }

  protected removeRange(index: number): void {
    this.withRanges(this.value().ranges.filter((_, i) => i !== index));
  }

  protected setTime(index: number, field: 'start' | 'end', time: string): void {
    this.withRanges(this.value().ranges.map((r, i) => (i === index ? { ...r, [field]: time } : r)));
  }

  /** Replaces every other open day's ranges with this day's. */
  protected copyToOpenDays(day: DayOfWeek): void {
    const source = this.value().ranges.filter(r => r.day === day);
    const openDays = new Set(this.value().ranges.map(r => r.day));
    const kept = this.value().ranges.filter(r => !openDays.has(r.day));
    const copied = DAYS_OF_WEEK.filter(d => openDays.has(d)).flatMap(d =>
      source.map(r => ({ day: d, start: r.start, end: r.end }))
    );
    this.withRanges([...kept, ...copied]);
  }

  protected setSlot(raw: string): void {
    const slot = Number(raw);
    if (!Number.isFinite(slot) || slot <= 0) {
      return;
    }
    this.update({ ...this.value(), slotMinutes: slot, maxBookingMinutes: clampMax(slot, this.value().maxBookingMinutes) });
  }

  protected setMax(raw: string): void {
    const max = Number(raw);
    if (Number.isFinite(max) && max > 0) {
      this.update({ ...this.value(), maxBookingMinutes: max });
    }
  }
}

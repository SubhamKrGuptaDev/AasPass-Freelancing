import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_AVAILABILITY, StoreAvailability } from '../../models/booking.model';
import { AvailabilityEditorComponent } from './availability-editor';

describe('AvailabilityEditorComponent', () => {
  let fixture: ComponentFixture<AvailabilityEditorComponent>;
  let emitted: StoreAvailability[];

  const el = () => fixture.nativeElement as HTMLElement;
  const button = (day: string, text: string) =>
    Array.from(el().querySelectorAll(`[data-day="${day}"] button`)).find(b => b.textContent?.trim() === text) as HTMLButtonElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailabilityEditorComponent);
    emitted = [];
    fixture.componentInstance.registerOnChange(v => emitted.push(v));
    fixture.componentInstance.writeValue(DEFAULT_AVAILABILITY);
    fixture.detectChanges();
  });

  it('renders 6 open days for the default availability', () => {
    expect(el().querySelectorAll('[data-day] [data-range]')).toHaveLength(6);
    expect(el().querySelector('[data-day="SUNDAY"] [data-range]')).toBeNull();
  });

  it('copies Monday ranges to all open days', () => {
    button('MONDAY', '+ Add time').click();
    fixture.detectChanges();
    expect(emitted.at(-1)?.ranges.filter(r => r.day === 'MONDAY')).toHaveLength(2);

    button('MONDAY', 'Copy to all open days').click();
    fixture.detectChanges();
    const ranges = emitted.at(-1)?.ranges ?? [];
    expect(ranges.filter(r => r.day === 'FRIDAY')).toHaveLength(2);
    expect(ranges.filter(r => r.day === 'SUNDAY')).toHaveLength(0);
  });

  it('disables + Add time after 4 rows', () => {
    for (let i = 0; i < 3; i++) {
      button('MONDAY', '+ Add time').click();
      fixture.detectChanges();
    }
    expect(el().querySelectorAll('[data-day="MONDAY"] [data-range]')).toHaveLength(4);
    expect(button('MONDAY', '+ Add time').disabled).toBe(true);
  });

  it('re-clamps the max booking when the slot changes', () => {
    fixture.componentInstance.writeValue({ ...DEFAULT_AVAILABILITY, slotMinutes: 30, maxBookingMinutes: 90 });
    (fixture.componentInstance as unknown as { setSlot(v: string): void }).setSlot('60');
    expect(emitted.at(-1)?.slotMinutes).toBe(60);
    expect(emitted.at(-1)?.maxBookingMinutes).toBe(120);
  });

  it('reports a validation error for overlapping ranges', () => {
    fixture.componentInstance.writeValue({
      ...DEFAULT_AVAILABILITY,
      ranges: [{ day: 'MONDAY', start: '09:00', end: '12:00' }, { day: 'MONDAY', start: '11:00', end: '13:00' }]
    });
    fixture.detectChanges();
    expect(el().textContent).toContain('Time ranges on the same day must not overlap');
    expect(fixture.componentInstance.validate({} as never)).not.toBeNull();
  });
});

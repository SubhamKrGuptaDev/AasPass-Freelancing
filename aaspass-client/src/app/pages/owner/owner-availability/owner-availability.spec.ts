import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { DEFAULT_AVAILABILITY, StoreAvailability } from '../../../models/booking.model';
import { AvailabilityHttpService } from '../../../services/booking';
import { StoreService } from '../../../services/store/store.service';
import { ToastService } from '../../../services/toast/toast.service';
import { OwnerAvailabilityComponent } from './owner-availability';

const SAVED: StoreAvailability = { slotMinutes: 60, maxBookingMinutes: 120, ranges: [{ day: 'MONDAY', start: '10:00', end: '14:00' }] };

function setup(opts: { get?: ReturnType<typeof of> | ReturnType<typeof throwError>; confirmedOutsideCount?: number } = {}) {
  const http = {
    get: vi.fn(() => opts.get ?? of(SAVED)),
    save: vi.fn((_id: string, a: StoreAvailability) => of({ availability: a, confirmedOutsideCount: opts.confirmedOutsideCount ?? 0 })),
    listExceptions: vi.fn(() => of([])),
    addException: vi.fn(),
    deleteException: vi.fn(() => of(undefined))
  };
  const toast = { warning: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() };
  const storeService = { userStores: signal([{ id: '7', storeName: 'My Store' }]), setBookingsOpen: vi.fn() };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AvailabilityHttpService, useValue: http },
      { provide: ToastService, useValue: toast },
      { provide: StoreService, useValue: storeService }
    ]
  });
  const fixture: ComponentFixture<OwnerAvailabilityComponent> = TestBed.createComponent(OwnerAvailabilityComponent);
  fixture.detectChanges();
  return { fixture, http, toast, storeService };
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('OwnerAvailabilityComponent', () => {
  it('loads the selected store availability and exceptions', async () => {
    const { fixture, http } = setup();
    await settle(fixture);
    expect(http.get).toHaveBeenCalledWith('7');
    expect(http.listExceptions).toHaveBeenCalled();
  });

  it('saves the edited value and shows the warning toast for confirmedOutsideCount 2', async () => {
    const { fixture, http, toast } = setup({ confirmedOutsideCount: 2 });
    await settle(fixture);
    fixture.componentInstance.availability.setValue({ ...SAVED, slotMinutes: 30 });
    fixture.componentInstance.saveWeekly();
    expect(http.save).toHaveBeenCalledWith('7', { ...SAVED, slotMinutes: 30 });
    expect(toast.warning).toHaveBeenCalledWith('2 confirmed bookings are now outside your hours');
  });

  it('does not warn when nothing is outside the hours', async () => {
    const { fixture, toast, storeService } = setup({ confirmedOutsideCount: 0 });
    await settle(fixture);
    fixture.componentInstance.saveWeekly();
    expect(storeService.setBookingsOpen).toHaveBeenCalledWith('7', SAVED.ranges.length > 0);
    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it('never saves when the availability failed to load', async () => {
    const { fixture, http } = setup({ get: throwError(() => new Error('x')) });
    await settle(fixture);
    fixture.componentInstance.saveWeekly();
    expect(http.save).not.toHaveBeenCalled();
    expect(fixture.componentInstance.availability.disabled).toBe(true);
    expect(DEFAULT_AVAILABILITY.ranges.length).toBe(6);
  });
});

import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { DaySlots } from '../../models/booking.model';
import { AuthService } from '../../services/auth/auth.service';
import { BookingHttpService, FunnelTrackingService } from '../../services/booking';
import { StoreService } from '../../services/store/store.service';
import { BookServiceComponent } from './book-service';
import { bookingDateStrip } from '../../utils/booking-time';

const STORE = {
  id: '7', userId: '2', storeName: 'Glow Studio', ownerName: 'Priya', bookingsOpen: true,
  services: [{ id: '3', name: 'Haircut', price: 300 }]
};

function day(slots: DaySlots['slots'], startTimes: string[]): DaySlots {
  return { date: '2026-11-02', open: true, slotMinutes: 30, maxBookingMinutes: 120, slots, startTimes };
}

function setup(opts: { loggedIn?: boolean; slots?: DaySlots; query?: Record<string, string> } = {}) {
  const http = {
    slots: vi.fn((_s: string, _d: string, _dur?: number | null) => of(opts.slots ?? day([{ time: '10:00', status: 'FREE', pendingCount: 0 }], ['10:00']))),
    create: vi.fn((_payload: unknown, _quiet?: boolean) => of({ id: 1, status: 'PENDING' }))
  };
  const funnel = { track: vi.fn((_s: string, _step: string, _svc?: string) => undefined), visitorId: vi.fn(() => 'visitor-1') };
  const auth = { isLoggedIn: signal(opts.loggedIn ?? false), openLoginModal: vi.fn() };
  const query = convertToParamMap(opts.query ?? { date: '2026-11-02', duration: '60', time: '10:00' });
  const params = convertToParamMap({ storeKey: 'glow-studio-7', serviceId: '3' });
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: BookingHttpService, useValue: http },
      { provide: FunnelTrackingService, useValue: funnel },
      { provide: AuthService, useValue: auth },
      { provide: StoreService, useValue: { getStoreByUrlKey: () => STORE } },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: params, queryParamMap: query } } }
    ]
  });
  const fixture: ComponentFixture<BookServiceComponent> = TestBed.createComponent(BookServiceComponent);
  fixture.detectChanges();
  return { fixture, http, auth, funnel, component: fixture.componentInstance };
}

describe('BookServiceComponent', () => {
  it('tracksPageViewOnceAndSlotSelection', async () => {
    const { fixture, funnel, component } = setup();
    await fixture.whenStable();
    expect(funnel.track).toHaveBeenCalledWith('7', 'BOOKING_PAGE_VIEW', '3');
    expect(funnel.track.mock.calls.filter(c => c[1] === 'BOOKING_PAGE_VIEW').length).toBe(1);
    component.pickTime({ time: '10:00', status: 'FREE', pendingCount: 0 });
    expect(funnel.track).toHaveBeenCalledWith('7', 'SLOT_SELECTED', '3');
  });

  it('sendsVisitorIdWithCreate', async () => {
    const { fixture, http, component } = setup({ loggedIn: true });
    await fixture.whenStable();
    component.submit();
    expect(http.create.mock.calls[0][0]).toMatchObject({ visitorId: 'visitor-1' });
  });

  it('restoresSelectionFromQueryParams', async () => {
    const { fixture, http, component } = setup();
    await fixture.whenStable();
    expect(component.date()).toBe('2026-11-02');
    expect(component.duration()).toBe(60);
    expect(component.time()).toBe('10:00');
    expect(http.slots).toHaveBeenCalledWith('7', '2026-11-02', 60);
  });

  it('anonymousSubmitOpensLoginModal', async () => {
    const { fixture, http, auth, component } = setup({ loggedIn: false });
    await fixture.whenStable();
    component.submit();
    expect(auth.openLoginModal).toHaveBeenCalled();
    expect(http.create).not.toHaveBeenCalled();
  });

  it('showsOthersRequested', async () => {
    const { fixture } = setup({ slots: day([{ time: '10:00', status: 'REQUESTED', pendingCount: 2 }], ['10:00']) });
    await fixture.whenStable();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('2 others requested');
  });

  it('submits with startAt built from date and time when logged in', async () => {
    const { fixture, http, component } = setup({ loggedIn: true });
    await fixture.whenStable();
    component.submit();
    expect(http.create).toHaveBeenCalledWith(
      { storeId: 7, serviceId: 3, startAt: '2026-11-02T10:00:00', durationMinutes: 60, visitorId: 'visitor-1' }, true);
    expect(component.booked()).not.toBeNull();
  });

  describe('duration resolution', () => {
    function storeDay(slotMinutes: number, maxBookingMinutes: number): DaySlots {
      return { date: '2026-11-02', open: true, slotMinutes, maxBookingMinutes, slots: [], startTimes: [] };
    }

    it.each([[45, 180, 45], [90, 180, 90], [30, 30, 30]])(
      'loads a slot-%i / max-%i store without error and settles on %i min', async (slot, max, expected) => {
        const { fixture, http, component } = setup({ slots: storeDay(slot, max), query: {} });
        await fixture.whenStable();
        expect(http.slots.mock.calls[0][2] ?? null).toBeNull();
        expect(component.duration()).toBe(expected);
        expect(component.errorMessage()).toBeNull();
        expect(component.durations()).toContain(expected);
      });

    it('clamps an invalid restored duration to the first allowed option', async () => {
      const { fixture, component } = setup({ slots: storeDay(45, 180), query: { duration: '60' } });
      await fixture.whenStable();
      expect(component.duration()).toBe(45);
    });

    it('keeps a valid restored duration and falls back to the first date for an out-of-strip date', async () => {
      const { fixture, component } = setup({ slots: storeDay(45, 180), query: { duration: '90', date: '1999-01-01' } });
      await fixture.whenStable();
      expect(component.duration()).toBe(90);
      expect(component.date()).toBe(bookingDateStrip(new Date())[0]);
    });
  });
});

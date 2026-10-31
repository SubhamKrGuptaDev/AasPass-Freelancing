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

function free(...times: string[]): DaySlots['slots'] {
  return times.map(time => ({ time, status: 'FREE' as const, pendingCount: 0 }));
}

function setup(opts: { loggedIn?: boolean; slots?: DaySlots; query?: Record<string, string>; mine?: { status: string }[] } = {}) {
  const http = {
    slots: vi.fn((_s: string, _d: string, _dur?: number | null) => of(opts.slots ?? day(free('10:00', '10:30'), ['10:00', '10:30']))),
    mine: vi.fn((status?: string, _page?: number, _size?: number, _quiet?: boolean) =>
      of({ content: (opts.mine ?? []).filter(b => !status || b.status === status) })),
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
    const { fixture, funnel, component } = setup({ query: {} });
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
    const { fixture, http, component } = setup({ slots: day(free('10:00', '10:30'), ['10:00', '10:30']) });
    await fixture.whenStable();
    expect(component.date()).toBe('2026-11-02');
    expect(component.duration()).toBe(60);
    expect(component.time()).toBe('10:00');
    expect(component.selected()).toEqual(['10:00', '10:30']);
    expect(http.slots).toHaveBeenCalledWith('7', '2026-11-02', null);
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

  describe('own pending requests', () => {
    const mine = [
      { id: 9, storeId: 7, status: 'PENDING', startAt: '2026-11-02T10:30:00', endAt: '2026-11-02T11:30:00', durationMinutes: 60 },
      { id: 10, storeId: 8, status: 'PENDING', startAt: '2026-11-02T10:00:00', endAt: '2026-11-02T10:30:00', durationMinutes: 30 }
    ];
    const times = ['10:00', '10:30', '11:00', '11:30'];
    const slots = (): DaySlots => {
      const s = free(...times);
      s[1] = { time: '10:30', status: 'REQUESTED', pendingCount: 2 };
      s[2] = { time: '11:00', status: 'REQUESTED', pendingCount: 1 };
      return day(s, times);
    };

    it('marks slots covered by my pending request at this store and blocks selecting them', async () => {
      const { fixture, http, component } = setup({ loggedIn: true, slots: slots(), mine, query: { date: '2026-11-02' } });
      await fixture.whenStable();
      fixture.detectChanges();
      expect(http.mine).toHaveBeenCalledWith('PENDING', 0, 100, true);
      expect([...component.myPendingTimes()]).toEqual(['10:30', '11:00']);
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text.match(/Your request · Pending/g)?.length).toBe(2);
      expect(text).toContain('1 other requested');
      component.pickTime({ time: '10:30', status: 'REQUESTED', pendingCount: 2 });
      expect(component.selected()).toEqual([]);
      component.pickTime({ time: '10:00', status: 'FREE', pendingCount: 0 });
      component.pickTime({ time: '11:30', status: 'FREE', pendingCount: 0 });
      expect(component.selected()).toEqual(['11:30']);
    });

    it('shows my confirmed booking in green, but not someone else\'s booked slot', async () => {
      const s = free(...times);
      s[0] = { time: '10:00', status: 'BOOKED', pendingCount: 0 };
      s[3] = { time: '11:30', status: 'BOOKED', pendingCount: 0 };
      const confirmed = [{ id: 11, storeId: 7, status: 'CONFIRMED', startAt: '2026-11-02T11:30:00', endAt: '2026-11-02T12:00:00', durationMinutes: 30 }];
      const { fixture, http, component } = setup({ loggedIn: true, slots: day(s, ['10:30', '11:00']), mine: confirmed, query: { date: '2026-11-02' } });
      await fixture.whenStable();
      fixture.detectChanges();
      expect(http.mine).toHaveBeenCalledWith('CONFIRMED', 0, 100, true);
      expect(component.isMyBooked(s[3])).toBe(true);
      expect(component.isMyBooked(s[0])).toBe(false);
      const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('[aria-labelledby="time-label"] button[aria-pressed]');
      expect(buttons[3].className).toContain('bg-emerald-50');
      expect(buttons[3].textContent).toContain('Your booking · Confirmed');
      expect(buttons[0].className).not.toContain('bg-emerald-50');
      expect(buttons[0].textContent).toContain('Booked');
    });

    it('skips the lookup when logged out', async () => {
      const { fixture, http, component } = setup({ loggedIn: false, slots: slots(), mine });
      await fixture.whenStable();
      expect(http.mine).not.toHaveBeenCalled();
      expect(component.myPendingTimes().size).toBe(0);
    });
  });

  describe('multi-slot selection', () => {
    const times = ['10:00', '10:30', '11:00', '11:30', '12:00'];

    async function ready(slots: DaySlots = day(free(...times), times)) {
      const ctx = setup({ loggedIn: true, slots, query: { date: '2026-11-02' } });
      await ctx.fixture.whenStable();
      return ctx;
    }

    const slot = (time: string) => ({ time, status: 'FREE' as const, pendingCount: 0 });

    it('extends to back-to-back slots and submits their total length', async () => {
      const { http, component } = await ready();
      component.pickTime(slot('10:00'));
      component.pickTime(slot('10:30'));
      component.pickTime(slot('11:00'));
      expect(component.selected()).toEqual(['10:00', '10:30', '11:00']);
      expect(component.duration()).toBe(90);
      expect(component.endTime()).toBe('11:30');
      component.submit();
      expect(http.create.mock.calls[0][0]).toMatchObject({ startAt: '2026-11-02T10:00:00', durationMinutes: 90 });
    });

    it('shows the selected time range and total on the submit button and the confirmation', async () => {
      const { fixture, http, component } = await ready();
      http.create.mockReturnValue(of({
        id: 1, status: 'PENDING', startAt: '2026-11-02T10:00:00', endAt: '2026-11-02T11:30:00', durationMinutes: 90
      }));
      component.pickTime(slot('10:00'));
      component.pickTime(slot('11:00'));
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('button[hlmBtn]')?.textContent).toContain('10:00 – 11:30 (1 h 30 min) · ₹450');
      expect(el.querySelector('[aria-live="polite"]')?.textContent).toContain('Amount: ₹450');
      component.submit();
      fixture.detectChanges();
      expect(el.querySelector('[role="status"]')?.textContent).toContain('2026-11-02 · 10:00 – 11:30 · 1 h 30 min');
      expect(el.querySelector('[role="status"]')?.textContent).toContain('Amount: ₹450');
    });

    it.each([[4, 350, 700], [1, 350, 175], [3, 125, 187.5]])(
      'charges the hourly rate pro rata: %i half-hour slots at ₹%i/h = ₹%d', async (count, rate, total) => {
        STORE.services[0].price = rate;
        try {
          const { component } = await ready();
          component.pickTime(slot('10:00'));
          if (count > 1) component.pickTime(slot(times[count - 1]));
          expect(component.amount()).toBe(total);
        } finally {
          STORE.services[0].price = 300;
        }
      });

    it('prefers the server-saved price on the confirmation', async () => {
      const { fixture, http, component } = await ready();
      http.create.mockReturnValue(of({
        id: 1, status: 'PENDING', startAt: '2026-11-02T10:00:00', endAt: '2026-11-02T10:30:00', durationMinutes: 30, price: 262.5
      }));
      component.pickTime(slot('10:00'));
      component.submit();
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).querySelector('[role="status"]')?.textContent).toContain('Amount: ₹262.50');
    });

    it('fills the gap when clicking a later free slot', async () => {
      const { component } = await ready();
      component.pickTime(slot('10:00'));
      component.pickTime(slot('11:00'));
      expect(component.selected()).toEqual(['10:00', '10:30', '11:00']);
    });

    it('shrinks from either end and trims when clicking inside', async () => {
      const { component } = await ready();
      component.pickTime(slot('10:00'));
      component.pickTime(slot('11:30'));
      component.pickTime(slot('10:00'));
      expect(component.selected()).toEqual(['10:30', '11:00', '11:30']);
      component.pickTime(slot('11:30'));
      expect(component.selected()).toEqual(['10:30', '11:00']);
      component.pickTime(slot('10:30'));
      component.pickTime(slot('11:00'));
      expect(component.selected()).toEqual([]);
    });

    it('starts a new selection across a booked slot', async () => {
      const slots = free(...times);
      slots[1] = { time: '10:30', status: 'BOOKED', pendingCount: 0 };
      const { component } = await ready(day(slots, ['10:00', '11:00', '11:30', '12:00']));
      component.pickTime(slot('10:00'));
      component.pickTime(slot('11:00'));
      expect(component.selected()).toEqual(['11:00']);
      expect(component.selectionHint()).toContain('back-to-back');
    });

    it('caps the selection at the max booking length', async () => {
      const { component } = await ready();
      component.pickTime(slot('10:00'));
      component.pickTime(slot('12:00'));
      expect(component.selected()).toEqual(['12:00']);
      expect(component.selectionHint()).toContain('at most 2 h');
    });

    it('keeps only the start slot when the restored run no longer fits, and falls back for an out-of-strip date', async () => {
      const { fixture, component } = setup({
        slots: day(free('10:00'), ['10:00']), query: { duration: '90', time: '10:00', date: '1999-01-01' }
      });
      await fixture.whenStable();
      expect(component.selected()).toEqual(['10:00']);
      expect(component.date()).toBe(bookingDateStrip(new Date())[0]);
    });
  });
});

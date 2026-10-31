import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { DaySlots } from '../../models/booking.model';
import { AuthService } from '../../services/auth/auth.service';
import { BookingHttpService } from '../../services/booking';
import { StoreService } from '../../services/store/store.service';
import { BookServiceComponent } from './book-service';

const STORE = {
  id: '7', userId: '2', storeName: 'Glow Studio', ownerName: 'Priya', bookingsOpen: true,
  services: [{ id: '3', name: 'Haircut', price: 300 }]
};

function day(slots: DaySlots['slots'], startTimes: string[]): DaySlots {
  return { date: '2026-11-02', open: true, slotMinutes: 30, maxBookingMinutes: 120, slots, startTimes };
}

function setup(opts: { loggedIn?: boolean; slots?: DaySlots } = {}) {
  const http = {
    slots: vi.fn(() => of(opts.slots ?? day([{ time: '10:00', status: 'FREE', pendingCount: 0 }], ['10:00']))),
    create: vi.fn(() => of({ id: 1, status: 'PENDING' }))
  };
  const auth = { isLoggedIn: signal(opts.loggedIn ?? false), openLoginModal: vi.fn() };
  const query = convertToParamMap({ date: '2026-11-02', duration: '60', time: '10:00' });
  const params = convertToParamMap({ storeKey: 'glow-studio-7', serviceId: '3' });
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: BookingHttpService, useValue: http },
      { provide: AuthService, useValue: auth },
      { provide: StoreService, useValue: { getStoreByUrlKey: () => STORE } },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: params, queryParamMap: query } } }
    ]
  });
  const fixture: ComponentFixture<BookServiceComponent> = TestBed.createComponent(BookServiceComponent);
  fixture.detectChanges();
  return { fixture, http, auth, component: fixture.componentInstance };
}

describe('BookServiceComponent', () => {
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
      { storeId: 7, serviceId: 3, startAt: '2026-11-02T10:00:00', durationMinutes: 60 }, true);
    expect(component.booked()).not.toBeNull();
  });
});

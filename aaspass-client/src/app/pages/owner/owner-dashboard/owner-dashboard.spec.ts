import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreService } from '../../../services/store/store.service';
import { OwnerDashboardComponent } from './owner-dashboard';

const booking = {
  id: 5, storeId: 7, storeName: 'S', serviceId: 3, serviceName: 'Haircut', userId: 1, userName: 'Asha',
  startAt: '2099-11-02T10:00:00', endAt: '2099-11-02T11:00:00', durationMinutes: 60, status: 'PENDING', price: 300
};

describe('OwnerDashboardComponent inbox', () => {
  it('shows the overlap badge and the outside-hours chip', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: StoreService, useValue: { userStores: signal([{ id: '7', storeName: 'S' }]) } }
      ]
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture: ComponentFixture<OwnerDashboardComponent> = TestBed.createComponent(OwnerDashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const req = http.expectOne(r => r.url === '/api/stores/7/bookings');
    expect(req.request.params.get('status')).toBe('PENDING');
    req.flush({
      success: true, message: 'ok',
      data: {
        content: [{ booking, overlapPendingCount: 1, overlapConfirmedCount: 1, outsideAvailability: true }],
        page: 0, size: 20, totalElements: 1, totalPages: 1
      }
    });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Overlaps with 2');
    expect(text).toContain('Outside your hours');
    expect(text).toContain('Asha');
  });
});

const analytics = (over: Record<string, unknown> = {}) => ({
  period: '7D',
  funnel: [
    { step: 'BOOK_CLICK', visitors: 10, conversionPercent: 100 },
    { step: 'BOOKING_PAGE_VIEW', visitors: 5, conversionPercent: 50 },
    { step: 'SLOT_SELECTED', visitors: 4, conversionPercent: 80 },
    { step: 'BOOKED', visitors: 2, conversionPercent: 50 }
  ],
  confirmed: 1, abandonedCount: 3, abandonedPercent: 60,
  buckets: ['2026-10-30', '2026-10-31'], clicks: [4, 6], bookings: [1, 1], abandoned: [1, 2],
  services: [{ serviceId: 3, name: 'Haircut', clicks: 10, bookings: 2, confirmed: 1, conversionPercent: 20 }],
  pendingCount: 1,
  ...over
});

const page = (content: unknown[]) => ({ success: true, message: 'ok', data: { content, page: 0, size: 10, totalElements: content.length, totalPages: 1 } });

describe('OwnerDashboardComponent analytics', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<OwnerDashboardComponent>;
  const el = () => fixture.nativeElement as HTMLElement;

  async function setup(bookingsOpen = true): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: StoreService, useValue: { userStores: signal([{ id: '7', storeName: 'S', bookingsOpen }]) } }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(OwnerDashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const analyticsReq = (period: string) =>
    http.expectOne(r => r.url === '/api/stores/7/booking-analytics' && r.params.get('period') === period);

  function flushAll(data: unknown, period = '7D'): void {
    analyticsReq(period).flush({ success: true, message: 'ok', data });
    http.expectOne(r => r.url === '/api/stores/7/booking-analytics/abandoned' && r.params.get('period') === period)
      .flush(page([{ userId: 9, userName: 'Ravi', avatarUrl: null, serviceName: 'Haircut', lastStep: 'SLOT_SELECTED', clickedAt: '2020-01-01T10:00:00' }]));
    http.match(r => r.url === '/api/stores/7/bookings').forEach(r => r.flush(page([])));
    fixture.detectChanges();
  }

  it('refetches with 30D when the period tab changes', async () => {
    await setup();
    flushAll(analytics());
    (el().querySelector('[data-period="30D"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    flushAll(analytics({ period: '30D' }), '30D');
    expect(el().querySelector('[data-period="30D"]')?.getAttribute('aria-selected')).toBe('true');
  });

  it('shows page views as 50% of book clicks', async () => {
    await setup();
    flushAll(analytics());
    const tile = el().querySelector('[data-kpi="BOOKING_PAGE_VIEW"]');
    expect(tile?.textContent).toContain('50%');
    expect(tile?.textContent).toContain('5');
    expect(el().querySelector('[data-kpi="CONFIRMED"]')?.textContent).toContain('50%');
    expect(el().querySelector('[data-kpi="ABANDONED"]')?.textContent).toContain('60%');
    expect(el().textContent).toContain('Ravi');
  });

  it('shows the empty state when the funnel is all zero', async () => {
    await setup();
    flushAll(analytics({
      funnel: ['BOOK_CLICK', 'BOOKING_PAGE_VIEW', 'SLOT_SELECTED', 'BOOKED'].map(step => ({ step, visitors: 0, conversionPercent: 0 })),
      abandonedCount: 0, abandonedPercent: 0, confirmed: 0, clicks: [0, 0], bookings: [0, 0], abandoned: [0, 0], services: []
    }));
    expect(el().textContent).toContain('No booking activity yet');
    expect(el().querySelector('[data-kpi="CONFIRMED"]')?.textContent).toContain('0%');
  });

  it('shows no banner when the owned store session copy has bookingsOpen true', async () => {
    await setup(true);
    flushAll(analytics());
    expect(el().querySelector('[data-bookings-closed]')).toBeNull();
  });

  it('shows an error state when the abandoned list fails to load', async () => {
    await setup();
    analyticsReq('7D').flush({ success: true, message: 'ok', data: analytics() });
    http.expectOne(r => r.url === '/api/stores/7/booking-analytics/abandoned').flush('x', { status: 500, statusText: 'err' });
    http.match(r => r.url === '/api/stores/7/bookings').forEach(r => r.flush(page([])));
    fixture.detectChanges();
    expect(el().querySelector('[data-abandoned-error]')).not.toBeNull();
    expect(el().textContent).not.toContain('Nobody abandoned');
  });

  it('links to Availability when bookings are not open', async () => {
    await setup(false);
    flushAll(analytics());
    expect(el().querySelector('[data-bookings-closed] a')?.getAttribute('href')).toContain('/owner-dashboard/availability');
  });
});

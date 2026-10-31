import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SKIP_ERROR_TOAST } from '../../interceptors/http-context';
import { BookingHttpService } from './booking-http.service';

const ok = (data: unknown) => ({ success: true, message: 'ok', data });

describe('BookingHttpService', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { service: TestBed.inject(BookingHttpService), http: TestBed.inject(HttpTestingController) };
  }

  it('GETs slots with date and duration and strips seconds', () => {
    const { service, http } = setup();
    let got: unknown;
    service.slots('7', '2026-11-02', 60).subscribe(d => (got = d));
    const req = http.expectOne(r => r.url === '/api/stores/7/slots');
    expect(req.request.params.get('date')).toBe('2026-11-02');
    expect(req.request.params.get('duration')).toBe('60');
    req.flush(ok({
      date: '2026-11-02', open: true, slotMinutes: 30, maxBookingMinutes: 120,
      slots: [{ time: '10:00:00', status: 'FREE', pendingCount: 0 }], startTimes: ['10:00:00']
    }));
    expect(got).toEqual({
      date: '2026-11-02', open: true, slotMinutes: 30, maxBookingMinutes: 120,
      slots: [{ time: '10:00', status: 'FREE', pendingCount: 0 }], startTimes: ['10:00']
    });
    http.verify();
  });

  it('POSTs a booking and can opt out of the error toast', () => {
    const { service, http } = setup();
    const payload = { storeId: 7, serviceId: 3, startAt: '2026-11-02T10:00:00', durationMinutes: 60 };
    service.create(payload, true).subscribe();
    const req = http.expectOne('/api/bookings');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.context.get(SKIP_ERROR_TOAST)).toBe(true);
    req.flush(ok({ id: 1 }));
    http.verify();
  });

  it('lists my bookings with paging and status', () => {
    const { service, http } = setup();
    let total = -1;
    service.mine('PENDING', 2).subscribe(p => (total = p.totalElements));
    const req = http.expectOne(r => r.url === '/api/bookings/mine');
    expect(req.request.params.get('status')).toBe('PENDING');
    expect(req.request.params.get('page')).toBe('2');
    req.flush(ok({ content: [], page: 2, size: 20, totalElements: 5, totalPages: 1 }));
    expect(total).toBe(5);
    http.verify();
  });

  it('PATCHes cancel and unwraps', () => {
    const { service, http } = setup();
    let status = '';
    service.cancel(9).subscribe(b => (status = b.status));
    const req = http.expectOne('/api/bookings/9/cancel');
    expect(req.request.method).toBe('PATCH');
    req.flush(ok({ id: 9, status: 'CANCELLED' }));
    expect(status).toBe('CANCELLED');
    http.verify();
  });
});

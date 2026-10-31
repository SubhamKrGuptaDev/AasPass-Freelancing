import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Schedule } from '../../models/booking.model';
import { OwnerBookingHttpService } from './owner-booking-http.service';

const ok = (data: unknown) => ({ success: true, message: 'ok', data });

describe('OwnerBookingHttpService', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { service: TestBed.inject(OwnerBookingHttpService), http: TestBed.inject(HttpTestingController) };
  }

  it('lists with status and paging', () => {
    const { service, http } = setup();
    service.list('7', 'PENDING', 1, 1).subscribe();
    const req = http.expectOne(r => r.url === '/api/stores/7/bookings');
    expect(req.request.params.get('status')).toBe('PENDING');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('1');
    req.flush(ok({ content: [], page: 1, size: 1, totalElements: 0, totalPages: 0 }));
    http.verify();
  });

  it('PATCHes a decision with a trimmed note', () => {
    const { service, http } = setup();
    let got: unknown;
    service.decide(5, 'REJECT', '  busy ').subscribe(r => (got = r));
    const req = http.expectOne('/api/bookings/5');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ action: 'REJECT', ownerNote: 'busy' });
    req.flush(ok({ booking: { id: 5 }, autoRejectedCount: 2 }));
    expect(got).toEqual({ booking: { id: 5 }, autoRejectedCount: 2 });
    http.verify();
  });

  it('omits a blank owner note', () => {
    const { service, http } = setup();
    service.decide(5, 'CONFIRM', '  ').subscribe();
    const req = http.expectOne('/api/bookings/5');
    expect(req.request.body).toEqual({ action: 'CONFIRM' });
    req.flush(ok({ booking: { id: 5 }, autoRejectedCount: 0 }));
  });

  it('normalizes schedule times', () => {
    const { service, http } = setup();
    let got: Schedule | undefined;
    service.schedule('7', '2026-11-02', '2026-11-02').subscribe(s => (got = s));
    const req = http.expectOne(r => r.url === '/api/stores/7/schedule');
    expect(req.request.params.get('from')).toBe('2026-11-02');
    req.flush(ok({
      slotMinutes: 30,
      days: [{
        date: '2026-11-02',
        openRanges: [{ start: '09:00:00', end: '13:00:00' }],
        exceptions: [{ id: 1, date: '2026-11-02', type: 'BLOCKED', start: '10:00:00', end: '11:00:00', reason: null, confirmedOutsideCount: 0 }],
        bookings: [], laneCount: 0
      }]
    }));
    expect(got?.days[0].openRanges).toEqual([{ start: '09:00', end: '13:00' }]);
    expect(got?.days[0].exceptions[0].start).toBe('10:00');
    expect(got?.days[0].laneCount).toBe(1);
    http.verify();
  });

  it('loads preview and overlaps', () => {
    const { service, http } = setup();
    service.preview('7', 3).subscribe();
    http.expectOne('/api/stores/7/bookings/3/confirm-preview').flush(ok({ canConfirm: true, conflictingConfirmed: [], willAutoReject: [] }));
    service.overlaps('7', 3).subscribe();
    http.expectOne('/api/stores/7/bookings/3/overlaps').flush(ok([]));
    http.verify();
  });
});

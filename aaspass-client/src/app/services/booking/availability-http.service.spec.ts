import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SaveAvailabilityResult, StoreAvailability } from '../../models/booking.model';
import { AvailabilityHttpService } from './availability-http.service';

describe('AvailabilityHttpService', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { service: TestBed.inject(AvailabilityHttpService), http: TestBed.inject(HttpTestingController) };
  }

  it('GETs availability, unwraps data and strips seconds from times', () => {
    const { service, http } = setup();
    let got: StoreAvailability | undefined;
    service.get('7').subscribe(a => (got = a));
    const req = http.expectOne('/api/stores/7/availability');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: { slotMinutes: 30, maxBookingMinutes: 120, ranges: [{ day: 'MONDAY', start: '09:00:00', end: '13:00:00' }] } });
    expect(got).toEqual({ slotMinutes: 30, maxBookingMinutes: 120, ranges: [{ day: 'MONDAY', start: '09:00', end: '13:00' }] });
    http.verify();
  });

  it('PUTs availability and unwraps the result', () => {
    const { service, http } = setup();
    const body: StoreAvailability = { slotMinutes: 60, maxBookingMinutes: 120, ranges: [{ day: 'TUESDAY', start: '10:00', end: '12:00' }] };
    let got: SaveAvailabilityResult | undefined;
    service.save('7', body).subscribe(r => (got = r));
    const req = http.expectOne('/api/stores/7/availability');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, message: 'ok', data: { availability: { ...body, ranges: [{ day: 'TUESDAY', start: '10:00:00', end: '12:00:00' }] }, confirmedOutsideCount: 2 } });
    expect(got?.confirmedOutsideCount).toBe(2);
    expect(got?.availability.ranges[0].start).toBe('10:00');
    http.verify();
  });

  it('lists, adds and deletes exceptions', () => {
    const { service, http } = setup();
    service.listExceptions('7', '2026-11-01', '2026-11-30').subscribe();
    const list = http.expectOne(r => r.url === '/api/stores/7/availability/exceptions');
    expect(list.request.params.get('from')).toBe('2026-11-01');
    expect(list.request.params.get('to')).toBe('2026-11-30');
    list.flush({ success: true, message: 'ok', data: [{ id: 1, date: '2026-11-02', type: 'OPEN', start: '10:00:00', end: '12:00:00', reason: null, confirmedOutsideCount: 0 }] });

    service.addException('7', { date: '2026-11-03', type: 'BLOCKED' }).subscribe();
    const add = http.expectOne('/api/stores/7/availability/exceptions');
    expect(add.request.method).toBe('POST');
    add.flush({ success: true, message: 'ok', data: { id: 2, date: '2026-11-03', type: 'BLOCKED', confirmedOutsideCount: 0 } });

    service.deleteException('7', 2).subscribe();
    const del = http.expectOne('/api/stores/7/availability/exceptions/2');
    expect(del.request.method).toBe('DELETE');
    del.flush({ success: true, message: 'ok', data: null });
    http.verify();
  });
});

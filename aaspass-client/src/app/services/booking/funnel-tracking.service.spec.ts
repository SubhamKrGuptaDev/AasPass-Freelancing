import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { SKIP_ERROR_TOAST } from '../../interceptors/http-context';
import { FunnelTrackingService } from './funnel-tracking.service';

describe('FunnelTrackingService', () => {
  function setup() {
    localStorage.removeItem('aaspass.visitorId');
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { service: TestBed.inject(FunnelTrackingService), http: TestBed.inject(HttpTestingController) };
  }

  it('visitorIdStableAcrossCalls', () => {
    const { service } = setup();
    const first = service.visitorId();
    expect(first.length).toBeGreaterThan(0);
    expect(service.visitorId()).toBe(first);
    expect(localStorage.getItem('aaspass.visitorId')).toBe(first);
  });

  it('visitorIdFallsBackToMemoryWhenStorageThrows', () => {
    const { service } = setup();
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const id = service.visitorId();
    expect(service.visitorId()).toBe(id);
    spy.mockRestore();
  });

  it('posts the step with visitor and service ids, skipping the error toast', () => {
    const { service, http } = setup();
    service.track('7', 'BOOK_CLICK', '3');
    const req = http.expectOne('/api/stores/7/funnel-events');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ step: 'BOOK_CLICK', visitorId: service.visitorId(), serviceId: 3 });
    expect(req.request.context.get(SKIP_ERROR_TOAST)).toBe(true);
    req.flush(null, { status: 204, statusText: 'No Content' });
    http.verify();
  });

  it('trackSwallowsErrors', () => {
    const { service, http } = setup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => service.track('7', 'BOOKING_PAGE_VIEW')).not.toThrow();
    const req = http.expectOne('/api/stores/7/funnel-events');
    expect(req.request.context.get(SKIP_ERROR_TOAST)).toBe(true);
    expect(req.request.body.serviceId).toBeUndefined();
    req.flush('boom', { status: 500, statusText: 'Server Error' });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    http.verify();
  });
});

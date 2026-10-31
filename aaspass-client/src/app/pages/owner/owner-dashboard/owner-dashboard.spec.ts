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

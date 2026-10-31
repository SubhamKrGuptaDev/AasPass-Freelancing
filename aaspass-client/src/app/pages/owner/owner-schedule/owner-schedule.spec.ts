import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Booking } from '../../../models/booking.model';
import { StoreService } from '../../../services/store/store.service';
import { OwnerScheduleComponent } from './owner-schedule';

function pending(id: number, hour: number): Booking {
  const h = String(hour).padStart(2, '0');
  return {
    id, storeId: 7, storeName: 'S', serviceId: 3, serviceName: 'Haircut', userId: id, userName: `U${id}`,
    startAt: `2099-11-02T${h}:00:00`, endAt: `2099-11-02T${h}:45:00`, durationMinutes: 45, status: 'PENDING'
  };
}

describe('OwnerScheduleComponent', () => {
  it('places overlapping bookings in lanes across the width', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: StoreService, useValue: { userStores: signal([{ id: '7', storeName: 'S' }]) } }
      ]
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture: ComponentFixture<OwnerScheduleComponent> = TestBed.createComponent(OwnerScheduleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const req = http.expectOne(r => r.url === '/api/stores/7/schedule');
    req.flush({
      success: true, message: 'ok',
      data: {
        slotMinutes: 30,
        days: [{
          date: '2099-11-02', openRanges: [{ start: '09:00:00', end: '18:00:00' }], exceptions: [], laneCount: 3,
          bookings: [0, 1, 2].map(i => ({ booking: pending(i + 1, 10), lane: i, conflictGroup: 1 }))
        }]
      }
    });
    fixture.detectChanges();

    const blocks = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[data-schedule-block]'));
    expect(blocks.map(b => b.style.left)).toEqual(['0%', '33.3%', '66.7%']);
    expect(blocks.every(b => b.style.width === '33.3%')).toBe(true);
  });
});

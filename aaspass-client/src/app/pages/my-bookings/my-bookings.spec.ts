import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Booking, BookingStatus } from '../../models/booking.model';
import { BookingHttpService } from '../../services/booking';
import { MyBookingsComponent } from './my-bookings';

function booking(id: number, status: BookingStatus): Booking {
  return {
    id, storeId: 7, storeName: 'Glow Studio', serviceId: 3, serviceName: 'Haircut', userId: 1, userName: 'A',
    startAt: '2026-11-02T10:00:00', endAt: '2026-11-02T11:00:00', durationMinutes: 60, status
  };
}

describe('MyBookingsComponent', () => {
  it('shows Cancel only for PENDING and CONFIRMED', async () => {
    const statuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'];
    const http = {
      mine: vi.fn(() => of({ content: statuses.map((s, i) => booking(i + 1, s)), page: 0, size: 20, totalElements: 5, totalPages: 1 })),
      cancel: vi.fn()
    };
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: BookingHttpService, useValue: http }] });
    const fixture: ComponentFixture<MyBookingsComponent> = TestBed.createComponent(MyBookingsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('[data-booking-row]');
    expect(rows.length).toBe(5);
    const withCancel = Array.from(rows).filter(r => r.querySelector('[data-cancel]')).map(r => r.getAttribute('data-status'));
    expect(withCancel).toEqual(['PENDING', 'CONFIRMED']);
  });
});

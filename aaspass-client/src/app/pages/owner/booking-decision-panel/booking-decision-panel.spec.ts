import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Booking, BookingStatus, OwnerBookingRow } from '../../../models/booking.model';
import { BookingDecisionPanelComponent } from './booking-decision-panel';

const ok = (data: unknown) => ({ success: true, message: 'ok', data });

function booking(id: number, status: BookingStatus, startAt = '2099-11-02T10:00:00'): Booking {
  return {
    id, storeId: 7, storeName: 'S', serviceId: 3, serviceName: 'Haircut', userId: 1, userName: 'Asha',
    startAt, endAt: startAt.replace('10:00', '11:00'), durationMinutes: 60, status
  };
}

function row(b: Booking): OwnerBookingRow {
  return { booking: b, overlapPendingCount: 0, overlapConfirmedCount: 0, outsideAvailability: false };
}

describe('BookingDecisionPanelComponent', () => {
  let fixture: ComponentFixture<BookingDecisionPanelComponent>;
  let http: HttpTestingController;
  let root: HTMLElement;
  let decided: number;

  function setup(b: Booking) {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(BookingDecisionPanelComponent);
    decided = 0;
    fixture.componentInstance.decided.subscribe(() => decided++);
    fixture.componentRef.setInput('booking', row(b));
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  }
  const btn = (sel: string) => root.querySelector<HTMLButtonElement>(sel);

  it('warns about auto-reject and needs a second click before deciding', () => {
    setup(booking(5, 'PENDING'));
    btn('[data-confirm]')!.click();
    http.expectOne('/api/stores/7/bookings/5/confirm-preview').flush(ok({
      canConfirm: true, conflictingConfirmed: [], willAutoReject: [booking(6, 'PENDING'), booking(7, 'PENDING')]
    }));
    fixture.detectChanges();
    expect(root.textContent).toContain('Confirming will auto-reject 2 overlapping request(s)');
    http.expectNone('/api/bookings/5');

    btn('[data-confirm]')!.click();
    const req = http.expectOne('/api/bookings/5');
    expect(req.request.body).toEqual({ action: 'CONFIRM' });
    req.flush(ok({ booking: booking(5, 'CONFIRMED'), autoRejectedCount: 2 }));
    expect(decided).toBe(1);
  });

  it('confirms straight away when nothing would be auto-rejected', () => {
    setup(booking(5, 'PENDING'));
    btn('[data-confirm]')!.click();
    http.expectOne('/api/stores/7/bookings/5/confirm-preview').flush(ok({ canConfirm: true, conflictingConfirmed: [], willAutoReject: [] }));
    http.expectOne('/api/bookings/5').flush(ok({ booking: booking(5, 'CONFIRMED'), autoRejectedCount: 0 }));
    expect(decided).toBe(1);
  });

  it('disables Confirm and shows the blocker when canConfirm is false', () => {
    setup(booking(5, 'PENDING'));
    btn('[data-confirm]')!.click();
    http.expectOne('/api/stores/7/bookings/5/confirm-preview').flush(ok({
      canConfirm: false, conflictingConfirmed: [{ ...booking(9, 'CONFIRMED'), userName: 'Ravi' }], willAutoReject: []
    }));
    fixture.detectChanges();
    expect(btn('[data-confirm]')!.disabled).toBe(true);
    expect(root.textContent).toContain('Ravi');
    http.expectNone('/api/bookings/5');
  });

  it('rejects with an optional note', () => {
    setup(booking(5, 'PENDING'));
    const note = root.querySelector<HTMLTextAreaElement>('[data-reject-note]')!;
    note.value = 'Closed that day';
    note.dispatchEvent(new Event('input'));
    btn('[data-reject]')!.click();
    const req = http.expectOne('/api/bookings/5');
    expect(req.request.body).toEqual({ action: 'REJECT', ownerNote: 'Closed that day' });
    req.flush(ok({ booking: booking(5, 'REJECTED'), autoRejectedCount: 0 }));
    expect(decided).toBe(1);
  });

  it('offers Mark complete only for past confirmed bookings', () => {
    setup(booking(5, 'CONFIRMED', '2020-01-02T10:00:00'));
    expect(btn('[data-complete]')).not.toBeNull();
    expect(btn('[data-confirm]')).toBeNull();
    fixture.destroy();
    TestBed.resetTestingModule();
    setup(booking(5, 'CONFIRMED'));
    expect(btn('[data-complete]')).toBeNull();
  });

  it('refreshes the parent when the server answers 409', () => {
    setup(booking(5, 'PENDING'));
    btn('[data-confirm]')!.click();
    http.expectOne('/api/stores/7/bookings/5/confirm-preview').flush(ok({ canConfirm: true, conflictingConfirmed: [], willAutoReject: [] }));
    http.expectOne('/api/bookings/5').flush({ success: false, message: 'This time overlaps a confirmed booking' }, { status: 409, statusText: 'Conflict' });
    expect(decided).toBe(1);
  });

  it('does not carry a preview or note over to another booking', () => {
    setup(booking(5, 'PENDING'));
    btn('[data-confirm]')!.click();
    http.expectOne('/api/stores/7/bookings/5/confirm-preview').flush(ok({
      canConfirm: true, conflictingConfirmed: [], willAutoReject: [booking(6, 'PENDING')]
    }));
    fixture.detectChanges();
    expect(root.textContent).toContain('auto-reject 1');

    fixture.componentRef.setInput('booking', row(booking(8, 'PENDING')));
    fixture.detectChanges();
    expect(root.textContent).not.toContain('auto-reject');
    btn('[data-confirm]')!.click();
    http.expectNone('/api/bookings/8');
    http.expectOne('/api/stores/7/bookings/8/confirm-preview');
  });
});

import { Service, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../config/api.config';
import { SKIP_ERROR_TOAST } from '../../interceptors/http-context';
import { Booking, BookingCreatePayload, BookingStatus, DaySlots } from '../../models/booking.model';
import { ApiResponse, PageResponse } from '../../models/response.model';
import { toHourMinute } from '../../utils/booking-time';

function normalizeDaySlots(d: DaySlots | null | undefined): DaySlots {
  return {
    date: d?.date ?? '',
    open: d?.open ?? false,
    slotMinutes: d?.slotMinutes ?? 30,
    maxBookingMinutes: d?.maxBookingMinutes ?? 120,
    slots: (d?.slots ?? []).map(s => ({ time: toHourMinute(s.time), status: s.status, pendingCount: s.pendingCount ?? 0 })),
    startTimes: (d?.startTimes ?? []).map(t => toHourMinute(t))
  };
}

@Service()
export class BookingHttpService {
  private readonly http = inject(HttpClient);

  /** Public: slot grid + offered start times for one day and duration. */
  slots(storeId: string | number, date: string, duration: number): Observable<DaySlots> {
    const params = new HttpParams().set('date', date).set('duration', String(duration));
    return this.http
      .get<ApiResponse<DaySlots>>(`${API_BASE_URL}/stores/${storeId}/slots`, { params })
      .pipe(map(resp => normalizeDaySlots(resp.data)));
  }

  /** Create a request. With `quiet` the failure is not toasted so the caller can show the message inline. */
  create(payload: BookingCreatePayload, quiet = false): Observable<Booking> {
    const context = new HttpContext().set(SKIP_ERROR_TOAST, quiet);
    return this.http
      .post<ApiResponse<Booking>>(`${API_BASE_URL}/bookings`, payload, { context })
      .pipe(map(resp => resp.data));
  }

  mine(status?: BookingStatus, page = 0, size = 20): Observable<PageResponse<Booking>> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (status) {
      params = params.set('status', status);
    }
    return this.http
      .get<ApiResponse<PageResponse<Booking>>>(`${API_BASE_URL}/bookings/mine`, { params })
      .pipe(map(resp => resp.data));
  }

  cancel(id: number): Observable<Booking> {
    return this.http
      .patch<ApiResponse<Booking>>(`${API_BASE_URL}/bookings/${id}/cancel`, {})
      .pipe(map(resp => resp.data));
  }
}

import { Service, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../config/api.config';
import { SKIP_ERROR_TOAST } from '../../interceptors/http-context';
import {
  AvailabilityException,
  Booking,
  BookingAction,
  BookingDecisionResult,
  BookingStatus,
  ConfirmPreview,
  OwnerBookingRow,
  Schedule,
  ScheduleDay
} from '../../models/booking.model';
import { ApiResponse, PageResponse } from '../../models/response.model';
import { toHourMinute } from '../../utils/booking-time';

function normalizeException(e: AvailabilityException): AvailabilityException {
  return { ...e, start: e.start ? toHourMinute(e.start) : null, end: e.end ? toHourMinute(e.end) : null };
}

function normalizeDay(d: ScheduleDay): ScheduleDay {
  return {
    date: d?.date ?? '',
    openRanges: (d?.openRanges ?? []).map(r => ({ start: toHourMinute(r.start), end: toHourMinute(r.end) })),
    exceptions: (d?.exceptions ?? []).map(normalizeException),
    bookings: d?.bookings ?? [],
    laneCount: Math.max(d?.laneCount ?? 1, 1)
  };
}

/** Owner-only booking endpoints: inbox, overlaps, confirm preview, decisions and the schedule. */
@Service()
export class OwnerBookingHttpService {
  private readonly http = inject(HttpClient);

  /** With `quiet` a failure is not toasted (used by the background navbar badge). */
  list(storeId: string | number, status: BookingStatus | undefined, page = 0, size = 20, quiet = false): Observable<PageResponse<OwnerBookingRow>> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (status) {
      params = params.set('status', status);
    }
    const context = new HttpContext().set(SKIP_ERROR_TOAST, quiet);
    return this.http
      .get<ApiResponse<PageResponse<OwnerBookingRow>>>(`${API_BASE_URL}/stores/${storeId}/bookings`, { params, context })
      .pipe(map(r => r.data));
  }

  overlaps(storeId: string | number, bookingId: number): Observable<Booking[]> {
    return this.http
      .get<ApiResponse<Booking[]>>(`${API_BASE_URL}/stores/${storeId}/bookings/${bookingId}/overlaps`)
      .pipe(map(r => r.data ?? []));
  }

  preview(storeId: string | number, bookingId: number): Observable<ConfirmPreview> {
    return this.http
      .get<ApiResponse<ConfirmPreview>>(`${API_BASE_URL}/stores/${storeId}/bookings/${bookingId}/confirm-preview`)
      .pipe(
        map(r => ({
          canConfirm: r.data?.canConfirm ?? false,
          conflictingConfirmed: r.data?.conflictingConfirmed ?? [],
          willAutoReject: r.data?.willAutoReject ?? []
        }))
      );
  }

  decide(bookingId: number, action: BookingAction, ownerNote?: string): Observable<BookingDecisionResult> {
    const body: { action: BookingAction; ownerNote?: string } = { action };
    if (ownerNote?.trim()) {
      body.ownerNote = ownerNote.trim();
    }
    return this.http
      .patch<ApiResponse<BookingDecisionResult>>(`${API_BASE_URL}/bookings/${bookingId}`, body)
      .pipe(map(r => ({ booking: r.data?.booking, autoRejectedCount: r.data?.autoRejectedCount ?? 0 }) as BookingDecisionResult));
  }

  /** `from`/`to` are 'yyyy-MM-dd', at most 7 days apart. */
  schedule(storeId: string | number, from: string, to: string): Observable<Schedule> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http
      .get<ApiResponse<Schedule>>(`${API_BASE_URL}/stores/${storeId}/schedule`, { params })
      .pipe(map(r => ({ slotMinutes: r.data?.slotMinutes ?? 30, days: (r.data?.days ?? []).map(normalizeDay) })));
  }
}

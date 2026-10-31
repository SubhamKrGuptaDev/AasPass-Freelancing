import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../config/api.config';
import {
  AvailabilityException,
  AvailabilityExceptionRequest,
  SaveAvailabilityResult,
  StoreAvailability
} from '../../models/booking.model';
import { ApiResponse } from '../../models/response.model';
import { toHourMinute } from '../../utils/booking-time';

/** Backend times arrive as 'HH:mm:ss'; the client works in 'HH:mm'. */
function normalizeAvailability(a: StoreAvailability | null | undefined): StoreAvailability {
  return {
    slotMinutes: a?.slotMinutes ?? 30,
    maxBookingMinutes: a?.maxBookingMinutes ?? 120,
    ranges: (a?.ranges ?? []).map(r => ({ day: r.day, start: toHourMinute(r.start), end: toHourMinute(r.end) }))
  };
}

function normalizeException(e: AvailabilityException): AvailabilityException {
  return { ...e, start: e.start ? toHourMinute(e.start) : null, end: e.end ? toHourMinute(e.end) : null };
}

/** Owner-managed availability: weekly ranges plus per-date exceptions. */
@Service()
export class AvailabilityHttpService {
  private readonly http = inject(HttpClient);

  private url(storeId: string | number): string {
    return `${API_BASE_URL}/stores/${storeId}/availability`;
  }

  get(storeId: string | number): Observable<StoreAvailability> {
    return this.http.get<ApiResponse<StoreAvailability>>(this.url(storeId)).pipe(map(r => normalizeAvailability(r.data)));
  }

  save(storeId: string | number, availability: StoreAvailability): Observable<SaveAvailabilityResult> {
    return this.http.put<ApiResponse<SaveAvailabilityResult>>(this.url(storeId), availability).pipe(
      map(r => ({
        availability: normalizeAvailability(r.data?.availability),
        confirmedOutsideCount: r.data?.confirmedOutsideCount ?? 0
      }))
    );
  }

  listExceptions(storeId: string | number, from?: string, to?: string): Observable<AvailabilityException[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http
      .get<ApiResponse<AvailabilityException[]>>(`${this.url(storeId)}/exceptions`, { params })
      .pipe(map(r => (r.data ?? []).map(normalizeException)));
  }

  addException(storeId: string | number, req: AvailabilityExceptionRequest): Observable<AvailabilityException> {
    return this.http
      .post<ApiResponse<AvailabilityException>>(`${this.url(storeId)}/exceptions`, req)
      .pipe(map(r => normalizeException(r.data)));
  }

  deleteException(storeId: string | number, exceptionId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url(storeId)}/exceptions/${exceptionId}`).pipe(map(() => undefined));
  }
}

import { Service, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { EMPTY, catchError } from 'rxjs';
import { API_BASE_URL } from '../../config/api.config';
import { SKIP_ERROR_TOAST } from '../../interceptors/http-context';

export type FunnelStepName = 'BOOK_CLICK' | 'BOOKING_PAGE_VIEW' | 'SLOT_SELECTED';

const VISITOR_KEY = 'aaspass.visitorId';

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Fire-and-forget booking funnel tracker keyed by a per-browser visitor id. */
@Service()
export class FunnelTrackingService {
  private readonly http = inject(HttpClient);
  private memoryId: string | null = null;

  /** Stable per-browser id (localStorage), with an in-memory fallback when storage is unavailable. */
  visitorId(): string {
    try {
      const stored = globalThis.localStorage?.getItem(VISITOR_KEY);
      if (stored) {
        return stored;
      }
      const id = this.memoryId ?? newId();
      globalThis.localStorage?.setItem(VISITOR_KEY, id);
      this.memoryId = id;
      return id;
    } catch {
      this.memoryId ??= newId();
      return this.memoryId;
    }
  }

  /** Reports a funnel step; never throws and never raises an error toast. */
  track(storeId: string, step: FunnelStepName, serviceId?: string): void {
    const sid = Number(serviceId);
    const body = {
      step,
      visitorId: this.visitorId(),
      ...(serviceId && Number.isInteger(sid) && sid > 0 ? { serviceId: sid } : {})
    };
    this.http
      .post<void>(`${API_BASE_URL}/stores/${storeId}/funnel-events`, body, {
        context: new HttpContext().set(SKIP_ERROR_TOAST, true)
      })
      .pipe(
        catchError(err => {
          console.warn('[funnel] tracking failed', err?.status ?? err);
          return EMPTY;
        })
      )
      .subscribe();
  }
}

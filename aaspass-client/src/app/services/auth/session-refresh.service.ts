import { InjectionToken, Service, inject } from '@angular/core';
import { Observable, defer, finalize, firstValueFrom, shareReplay } from 'rxjs';
import { ApiResponse, BackendUserResponse } from '../../models/response.model';
import { AuthHttpService } from './auth-http.service';

/** Web Locks name that serialises POST /auth/refresh across every tab of the app. */
export const REFRESH_LOCK_NAME = 'aaspass-refresh';

/** The browser's Web Locks manager, or null where the API is unavailable (older browsers, tests). */
export const REFRESH_LOCK_MANAGER = new InjectionToken<LockManager | null>('REFRESH_LOCK_MANAGER', {
  providedIn: 'root',
  factory: () => (typeof navigator !== 'undefined' && navigator.locks ? navigator.locks : null)
});

/**
 * Runs POST /auth/refresh at most once at a time. Inside a tab every caller shares the in-flight call;
 * across tabs the call runs under a Web Lock, so a second tab only refreshes after the first one has
 * stored the rotated cookies and therefore never replays an already-rotated refresh token.
 * Without Web Locks it falls back to the in-tab single-flight only.
 */
@Service()
export class SessionRefreshService {
  private readonly authHttp = inject(AuthHttpService);
  private readonly locks = inject(REFRESH_LOCK_MANAGER);

  private inFlight$: Observable<ApiResponse<BackendUserResponse>> | null = null;

  refresh(): Observable<ApiResponse<BackendUserResponse>> {
    if (!this.inFlight$) {
      this.inFlight$ = this.lockedRefresh().pipe(
        finalize(() => {
          this.inFlight$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.inFlight$;
  }

  private lockedRefresh(): Observable<ApiResponse<BackendUserResponse>> {
    const locks = this.locks;
    if (!locks) {
      return this.authHttp.refresh();
    }
    return defer(() => locks.request(REFRESH_LOCK_NAME, () => firstValueFrom(this.authHttp.refresh())));
  }
}

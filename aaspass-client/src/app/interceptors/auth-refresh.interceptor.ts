import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { ApiResponse, BackendUserResponse } from '../models/response.model';
import { AuthHttpService } from '../services/auth/auth-http.service';
import { AuthService } from '../services/auth/auth.service';
import { errorCode } from './error-toast.interceptor';
import { SKIP_AUTH_REFRESH } from './http-context';

/** Auth endpoints that must never be retried through a refresh, even without the context flag. */
const AUTH_ENDPOINT = /\/auth\/(login|register|refresh|logout)(\?|$)/;

/** The one refresh call shared by every request that hits a 401 while it is in flight. */
let refreshInFlight$: Observable<ApiResponse<BackendUserResponse>> | null = null;

function sharedRefresh(authHttp: AuthHttpService): Observable<ApiResponse<BackendUserResponse>> {
  if (!refreshInFlight$) {
    refreshInFlight$ = authHttp.refresh().pipe(
      finalize(() => {
        refreshInFlight$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
  }
  return refreshInFlight$;
}

function shouldRefresh(err: unknown, authService: AuthService): boolean {
  if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
    return false;
  }
  const code = errorCode(err);
  return code === 'TOKEN_EXPIRED' || (code === 'UNAUTHENTICATED' && authService.isLoggedIn());
}

/**
 * Silently renews the access cookie: on a 401 TOKEN_EXPIRED (or UNAUTHENTICATED while a user is
 * believed logged in) it runs one shared POST /auth/refresh and retries the original request once.
 * If the refresh fails the session is ended and the original error is re-thrown. Registered after
 * the error-toast interceptor so that interceptor only sees the final outcome.
 */
export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH_REFRESH) || AUTH_ENDPOINT.test(req.url)) {
    return next(req);
  }
  const authService = inject(AuthService);
  const authHttp = inject(AuthHttpService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!shouldRefresh(err, authService)) {
        return throwError(() => err);
      }
      return sharedRefresh(authHttp).pipe(
        catchError(() => {
          authService.handleSessionEnded();
          return throwError(() => err);
        }),
        switchMap(() => next(req))
      );
    })
  );
};

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AdminAuthService } from '../services/admin-auth.service';
import { errorCode } from './error-toast.interceptor';
import { SKIP_AUTH_REFRESH, markErrorToastHandled } from './http-context';

/** Auth endpoints that must never be retried through a refresh. */
const AUTH_ENDPOINT = /\/api\/admin\/auth\/(login|refresh|logout)(\?|$)/;

function shouldRefresh(err: unknown, auth: AdminAuthService): boolean {
  if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
    return false;
  }
  const code = errorCode(err);
  return code === 'TOKEN_EXPIRED' || (code === 'UNAUTHENTICATED' && auth.isAuthenticated());
}

/**
 * Silently renews the access cookie: on 401 TOKEN_EXPIRED (or UNAUTHENTICATED while signed in) it runs
 * the shared POST /api/admin/auth/refresh and retries the original request once. A refresh rejected
 * with 401 ends the session; other refresh failures surface the refresh error without ending it.
 */
export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH_REFRESH) || AUTH_ENDPOINT.test(req.url)) {
    return next(req);
  }
  const auth = inject(AdminAuthService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!shouldRefresh(err, auth)) {
        return throwError(() => err);
      }
      return auth.refresh().pipe(
        catchError((refreshErr: unknown) => {
          if (refreshErr instanceof HttpErrorResponse && refreshErr.status === 401) {
            // handleSessionEnded shows the only toast; the original 401 must not add "Please log in".
            auth.handleSessionEnded();
            return throwError(() => markErrorToastHandled(err));
          }
          return throwError(() => refreshErr);
        }),
        switchMap(() => next(req))
      );
    })
  );
};

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { SessionRefreshService } from '../services/auth/session-refresh.service';
import { errorCode } from './error-toast.interceptor';
import { SKIP_AUTH_REFRESH } from './http-context';

/** Auth endpoints that must never be retried through a refresh, even without the context flag. */
const AUTH_ENDPOINT = /\/auth\/(login|register|refresh|logout)(\?|$)/;

function shouldRefresh(err: unknown, authService: AuthService): boolean {
  if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
    return false;
  }
  const code = errorCode(err);
  return code === 'TOKEN_EXPIRED' || (code === 'UNAUTHENTICATED' && authService.isLoggedIn());
}

function isRevokedWhileLoggedIn(err: unknown, authService: AuthService): boolean {
  return err instanceof HttpErrorResponse
    && err.status === 401
    && errorCode(err) === 'SESSION_REVOKED'
    && authService.isLoggedIn();
}

/**
 * Silently renews the access cookie: on a 401 TOKEN_EXPIRED (or UNAUTHENTICATED while a user is
 * believed logged in) it runs the shared POST /auth/refresh ({@link SessionRefreshService}: one call per
 * tab, serialised across tabs) and retries the original request once.
 * If the refresh is rejected with 401 the session is ended and the original error is re-thrown; any
 * other refresh failure keeps the user and re-throws the refresh error. A 401 SESSION_REVOKED while
 * logged in ends the session without a refresh attempt. Registered after
 * the error-toast interceptor so that interceptor only sees the final outcome.
 */
export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH_REFRESH) || AUTH_ENDPOINT.test(req.url)) {
    return next(req);
  }
  const authService = inject(AuthService);
  const sessionRefresh = inject(SessionRefreshService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (isRevokedWhileLoggedIn(err, authService)) {
        // The server killed the session (logout elsewhere, reuse detection): refreshing cannot help.
        authService.handleSessionEnded();
        return throwError(() => err);
      }
      if (!shouldRefresh(err, authService)) {
        return throwError(() => err);
      }
      return sessionRefresh.refresh().pipe(
        catchError((refreshErr: unknown) => {
          if (refreshErr instanceof HttpErrorResponse && refreshErr.status === 401) {
            authService.handleSessionEnded();
            return throwError(() => err);
          }
          // Network / server failure: the session may still be valid, so keep the user and surface the
          // refresh error so the error-toast interceptor shows the connection or server message.
          return throwError(() => refreshErr);
        }),
        switchMap(() => next(req))
      );
    })
  );
};

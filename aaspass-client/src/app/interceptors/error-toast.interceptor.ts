import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastType } from '../models/toast.model';
import { ToastService } from '../services/toast/toast.service';
import { SKIP_ERROR_TOAST, isErrorToastHandled } from './http-context';

interface ToastMessage {
  type: ToastType;
  message: string;
}

const FORBIDDEN_MESSAGE = "You don't have permission to do that.";
const NOT_FOUND_FALLBACK = "We couldn't find what you were looking for.";
const NETWORK_MESSAGE = "Can't reach AasPass right now. Check your connection.";
const SERVER_MESSAGE = 'Something went wrong on our side. Please try again.';
const GENERIC_CLIENT_MESSAGE = 'Something went wrong. Please try again.';

/** Returns the server-provided user-facing message only from an ApiResponse-shaped body. */
function serverMessage(err: HttpErrorResponse): string | null {
  const body: unknown = err.error;
  if (body === null || typeof body !== 'object') {
    return null;
  }
  const message = (body as { message?: unknown }).message;
  return typeof message === 'string' && message.trim().length > 0 ? message : null;
}

/** Reads the ApiResponse error `code` from a failed response body, or null when absent. */
export function errorCode(err: HttpErrorResponse): string | null {
  const body: unknown = err.error;
  if (body === null || typeof body !== 'object') {
    return null;
  }
  const code = (body as { code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

/**
 * Maps an HTTP failure to a friendly toast, or null when no toast should be shown.
 * Never exposes raw text, stack traces or non-ApiResponse bodies.
 */
export function toastMessageFor(err: HttpErrorResponse): ToastMessage | null {
  const status = err.status;
  const code = errorCode(err);

  if (status === 0) {
    return { type: 'error', message: NETWORK_MESSAGE };
  }
  if (status === 401) {
    switch (code) {
      case 'TOKEN_EXPIRED':
        return null;
      case 'SESSION_REVOKED':
        return { type: 'warning', message: 'Your session has ended. Please log in again.' };
      case 'INVALID_CREDENTIALS':
        return { type: 'error', message: 'Invalid username or password.' };
      default:
        return { type: 'warning', message: 'Please log in to continue.' };
    }
  }
  if (status === 403) {
    if (code === 'CSRF_INVALID') {
      return { type: 'error', message: 'Security check failed. Please refresh the page and try again.' };
    }
    if (code === 'ACCOUNT_SUSPENDED' || code === 'STORE_BLOCKED_BY_ADMIN') {
      return { type: 'error', message: serverMessage(err) ?? FORBIDDEN_MESSAGE };
    }
    return { type: 'error', message: FORBIDDEN_MESSAGE };
  }
  if (status === 404) {
    return { type: 'error', message: serverMessage(err) ?? NOT_FOUND_FALLBACK };
  }
  if (status === 429) {
    return { type: 'error', message: serverMessage(err) ?? GENERIC_CLIENT_MESSAGE };
  }
  if (status >= 500) {
    return { type: 'error', message: SERVER_MESSAGE };
  }
  if (status === 400 || status === 409) {
    return { type: 'error', message: serverMessage(err) ?? GENERIC_CLIENT_MESSAGE };
  }
  return { type: 'error', message: GENERIC_CLIENT_MESSAGE };
}

/**
 * Shows a friendly toast for failed API calls, then re-throws so callers can still react. Errors an
 * inner interceptor already reported (see {@link isErrorToastHandled}) get no second toast.
 */
export const errorToastInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && !req.context.get(SKIP_ERROR_TOAST) && !isErrorToastHandled(err)) {
        const result = toastMessageFor(err);
        if (result) {
          toast.show(result.type, result.message);
        }
      }
      return throwError(() => err);
    })
  );
};

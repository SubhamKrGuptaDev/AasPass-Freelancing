import { HttpContextToken } from '@angular/common/http';

/** Set to true on requests whose failure is expected and must not raise an error toast. */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/** Set to true on requests that must never trigger the silent token-refresh flow. */
export const SKIP_AUTH_REFRESH = new HttpContextToken<boolean>(() => false);

/** Errors whose user-facing message was already shown (e.g. "Your session has ended"). */
const toastHandledErrors = new WeakSet<object>();

/** Marks an error as already reported, so the error-toast interceptor stays silent for it. */
export function markErrorToastHandled<T>(err: T): T {
  if (typeof err === 'object' && err !== null) {
    toastHandledErrors.add(err);
  }
  return err;
}

/** @return true when {@link markErrorToastHandled} was called for this error. */
export function isErrorToastHandled(err: unknown): boolean {
  return typeof err === 'object' && err !== null && toastHandledErrors.has(err);
}

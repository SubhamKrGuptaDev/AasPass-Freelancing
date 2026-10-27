import { HttpContextToken } from '@angular/common/http';

/** Set to true on requests whose failure is expected and must not raise an error toast. */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/** Set to true on requests that must never trigger the silent token-refresh flow. */
export const SKIP_AUTH_REFRESH = new HttpContextToken<boolean>(() => false);

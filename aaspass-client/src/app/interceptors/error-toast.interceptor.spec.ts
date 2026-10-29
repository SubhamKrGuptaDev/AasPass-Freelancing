import { HttpClient, HttpContext, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ToastService } from '../services/toast/toast.service';
import { errorToastInterceptor, toastMessageFor } from './error-toast.interceptor';
import { SKIP_ERROR_TOAST } from './http-context';

function err(status: number, body: unknown = null): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

describe('toastMessageFor', () => {
  it('401 TOKEN_EXPIRED shows nothing', () => {
    expect(toastMessageFor(err(401, { code: 'TOKEN_EXPIRED' }))).toBeNull();
  });
  it('401 SESSION_REVOKED', () => {
    expect(toastMessageFor(err(401, { code: 'SESSION_REVOKED' })))
      .toEqual({ type: 'warning', message: 'Your session has ended. Please log in again.' });
  });
  it('401 UNAUTHENTICATED', () => {
    expect(toastMessageFor(err(401, { code: 'UNAUTHENTICATED' })))
      .toEqual({ type: 'warning', message: 'Please log in to continue.' });
  });
  it('401 without code behaves as UNAUTHENTICATED', () => {
    expect(toastMessageFor(err(401, 'oops')))
      .toEqual({ type: 'warning', message: 'Please log in to continue.' });
  });
  it('401 INVALID_CREDENTIALS', () => {
    expect(toastMessageFor(err(401, { code: 'INVALID_CREDENTIALS' })))
      .toEqual({ type: 'error', message: 'Invalid username or password.' });
  });
  it('403 FORBIDDEN', () => {
    expect(toastMessageFor(err(403, { code: 'FORBIDDEN' })))
      .toEqual({ type: 'error', message: "You don't have permission to do that." });
  });
  it('403 ACCOUNT_SUSPENDED shows the server message', () => {
    expect(toastMessageFor(err(403, { code: 'ACCOUNT_SUSPENDED', message: 'Account suspended until 2026-11-01 10:00 UTC: spam' })))
      .toEqual({ type: 'error', message: 'Account suspended until 2026-11-01 10:00 UTC: spam' });
  });
  it('403 STORE_BLOCKED_BY_ADMIN shows the server message, with a fallback', () => {
    expect(toastMessageFor(err(403, { code: 'STORE_BLOCKED_BY_ADMIN', message: 'Blocked by admin' })))
      .toEqual({ type: 'error', message: 'Blocked by admin' });
    expect(toastMessageFor(err(403, { code: 'STORE_BLOCKED_BY_ADMIN' })))
      .toEqual({ type: 'error', message: "You don't have permission to do that." });
  });
  it('403 CSRF_INVALID', () => {
    expect(toastMessageFor(err(403, { code: 'CSRF_INVALID' })))
      .toEqual({ type: 'error', message: 'Security check failed. Please refresh the page and try again.' });
  });
  it('400 uses the server message', () => {
    expect(toastMessageFor(err(400, { message: 'Username already in use' })))
      .toEqual({ type: 'error', message: 'Username already in use' });
  });
  it('409 uses the server message', () => {
    expect(toastMessageFor(err(409, { message: 'Duplicate' })))
      .toEqual({ type: 'error', message: 'Duplicate' });
  });
  it('404 uses the server message when present', () => {
    expect(toastMessageFor(err(404, { message: 'Store not found' })))
      .toEqual({ type: 'error', message: 'Store not found' });
  });
  it('404 without message falls back', () => {
    expect(toastMessageFor(err(404, null)))
      .toEqual({ type: 'error', message: "We couldn't find what you were looking for." });
  });
  it('404 with a raw string body falls back', () => {
    expect(toastMessageFor(err(404, '<html>Not Found</html>')))
      .toEqual({ type: 'error', message: "We couldn't find what you were looking for." });
  });
  it('status 0 shows the connection message', () => {
    expect(toastMessageFor(err(0)))
      .toEqual({ type: 'error', message: "Can't reach AasPass right now. Check your connection." });
  });
  it('503 shows the server message', () => {
    expect(toastMessageFor(err(503)))
      .toEqual({ type: 'error', message: 'Something went wrong on our side. Please try again.' });
  });
});

describe('errorToastInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let toasts: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([errorToastInterceptor])), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    toasts = TestBed.inject(ToastService);
  });

  afterEach(() => {
    toasts.clear();
    httpTesting.verify();
  });

  it('shows a toast for a failing request', () => {
    http.get('/api/x').subscribe({ error: () => undefined });
    httpTesting.expectOne('/api/x').flush({ code: 'FORBIDDEN' }, { status: 403, statusText: 'Forbidden' });
    expect(toasts.toasts().map(t => t.message)).toEqual(["You don't have permission to do that."]);
  });

  it('skipTokenSuppressesToast', () => {
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
    http.get('/api/x', { context }).subscribe({ error: () => undefined });
    httpTesting.expectOne('/api/x').flush(null, { status: 500, statusText: 'Server Error' });
    expect(toasts.toasts()).toEqual([]);
  });

  it('errorIsRethrown', () => {
    const onError = vi.fn();
    http.get('/api/x').subscribe({ error: onError });
    httpTesting.expectOne('/api/x').flush(null, { status: 500, statusText: 'Server Error' });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('nonApiFailureWithHtmlBodyUsesGenericMessage', () => {
    http.get('/api/x').subscribe({ error: () => undefined });
    httpTesting.expectOne('/api/x').flush('<html>boom</html>', { status: 500, statusText: 'Server Error' });
    expect(toasts.toasts().map(t => t.message)).toEqual(['Something went wrong on our side. Please try again.']);
  });
});

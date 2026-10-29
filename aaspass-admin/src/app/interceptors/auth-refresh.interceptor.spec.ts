import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { ToastService } from '../services/toast.service';
import { authRefreshInterceptor } from './auth-refresh.interceptor';
import { errorToastInterceptor } from './error-toast.interceptor';

const REFRESH_URL = '/api/admin/auth/refresh';
const TOKEN_EXPIRED = { success: false, message: 'Access token expired', code: 'TOKEN_EXPIRED' };
const ADMIN = { id: 1, name: 'Root', email: 'a@b.c' };

describe('authRefreshInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let auth: AdminAuthService;
  let toast: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        provideHttpClient(withInterceptors([errorToastInterceptor, authRefreshInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AdminAuthService);
    toast = TestBed.inject(ToastService);
  });

  afterEach(() => {
    httpTesting.verify();
    toast.clear();
  });

  it('retriesOnceAfterRefresh', () => {
    let value: string | null = null;
    http.get<{ v: string }>('/api/admin/stores').subscribe((r) => (value = r.v));
    httpTesting.expectOne('/api/admin/stores').flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });
    const refresh = httpTesting.expectOne(REFRESH_URL);
    expect(refresh.request.method).toBe('POST');
    refresh.flush({ success: true, message: 'ok', data: ADMIN });
    httpTesting.expectOne('/api/admin/stores').flush({ v: 'ok' });
    expect(value).toBe('ok');
  });

  it('doesNotRetryTwice', () => {
    let error: HttpErrorResponse | null = null;
    http.get('/api/admin/stores').subscribe({ error: (e: HttpErrorResponse) => (error = e) });
    httpTesting.expectOne('/api/admin/stores').flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne(REFRESH_URL).flush({ success: true, message: 'ok', data: ADMIN });
    httpTesting.expectOne('/api/admin/stores').flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectNone(REFRESH_URL);
    expect((error as HttpErrorResponse | null)?.status).toBe(401);
  });

  it('refreshesOnceForConcurrent401s', () => {
    const results: string[] = [];
    http.get<{ v: string }>('/api/admin/a').subscribe((r) => results.push(r.v));
    http.get<{ v: string }>('/api/admin/b').subscribe((r) => results.push(r.v));
    httpTesting.expectOne('/api/admin/a').flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne('/api/admin/b').flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });
    const refreshes = httpTesting.match(REFRESH_URL);
    expect(refreshes.length).toBe(1);
    refreshes[0].flush({ success: true, message: 'ok', data: ADMIN });
    httpTesting.expectOne('/api/admin/a').flush({ v: 'a' });
    httpTesting.expectOne('/api/admin/b').flush({ v: 'b' });
    expect(results.sort()).toEqual(['a', 'b']);
  });

  it('endsSessionWhenRefreshReturns401', () => {
    const ended = vi.spyOn(auth, 'handleSessionEnded');
    let error: HttpErrorResponse | null = null;
    http.get('/api/admin/stores').subscribe({ error: (e: HttpErrorResponse) => (error = e) });
    httpTesting.expectOne('/api/admin/stores').flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });
    httpTesting
      .expectOne(REFRESH_URL)
      .flush({ success: false, message: 'expired', code: 'SESSION_REVOKED' }, { status: 401, statusText: 'Unauthorized' });
    expect(ended).toHaveBeenCalledTimes(1);
    expect((error as HttpErrorResponse | null)?.status).toBe(401);
  });

  it('neverRefreshesAuthEndpoints', () => {
    http.post('/api/admin/auth/login', {}).subscribe({ error: () => undefined });
    httpTesting.expectOne('/api/admin/auth/login').flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectNone(REFRESH_URL);
  });

  it('showsInvalidCredentialsToast', () => {
    http.post('/api/admin/auth/login', {}).subscribe({ error: () => undefined });
    httpTesting
      .expectOne('/api/admin/auth/login')
      .flush({ success: false, message: 'x', code: 'INVALID_CREDENTIALS' }, { status: 401, statusText: 'Unauthorized' });
    expect(toast.toasts()[0]?.message).toBe('Invalid email or password.');
  });
});

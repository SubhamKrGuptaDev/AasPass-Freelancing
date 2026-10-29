import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authRefreshInterceptor } from '../interceptors/auth-refresh.interceptor';
import { errorToastInterceptor } from '../interceptors/error-toast.interceptor';
import { SKIP_AUTH_REFRESH, SKIP_ERROR_TOAST } from '../interceptors/http-context';
import { AdminAuthService } from './admin-auth.service';
import { ToastService } from './toast.service';

const ME_URL = '/api/admin/auth/me';
const REFRESH_URL = '/api/admin/auth/refresh';
const ADMIN = { id: 1, name: 'Root', email: 'a@b.c' };
const UNAUTHENTICATED = { success: false, message: 'Please log in', code: 'UNAUTHENTICATED' };
const UNAUTHORIZED = { status: 401, statusText: 'Unauthorized' };

describe('AdminAuthService.restore', () => {
  let httpTesting: HttpTestingController;
  let auth: AdminAuthService;
  let toast: ToastService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        provideHttpClient(withInterceptors([errorToastInterceptor, authRefreshInterceptor])),
        provideHttpClientTesting()
      ]
    });
    httpTesting = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AdminAuthService);
    toast = TestBed.inject(ToastService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
    toast.clear();
  });

  it('restoresSignedInAdminFromMe', async () => {
    const done = auth.restore();
    httpTesting.expectOne(ME_URL).flush({ success: true, message: 'ok', data: ADMIN });
    await done;
    expect(auth.admin()).toEqual(ADMIN);
    httpTesting.expectNone(REFRESH_URL);
  });

  it('refreshesOnceWhenAccessCookieExpired', async () => {
    const done = auth.restore();
    // The 15-minute access cookie is gone: /me answers 401 UNAUTHENTICATED while not yet signed in.
    httpTesting.expectOne(ME_URL).flush(UNAUTHENTICATED, UNAUTHORIZED);
    const refresh = httpTesting.expectOne(REFRESH_URL);
    expect(refresh.request.method).toBe('POST');
    expect(refresh.request.context.get(SKIP_ERROR_TOAST)).toBe(true);
    expect(refresh.request.context.get(SKIP_AUTH_REFRESH)).toBe(true);
    refresh.flush({ success: true, message: 'ok', data: ADMIN });
    await done;
    expect(auth.admin()).toEqual(ADMIN);
    expect(auth.isAuthenticated()).toBe(true);
    httpTesting.expectNone(REFRESH_URL);
  });

  it('becomesGuestSilentlyWhenRefreshRejected', async () => {
    const navigate = vi.spyOn(router, 'navigate');
    const done = auth.restore();
    httpTesting.expectOne(ME_URL).flush(UNAUTHENTICATED, UNAUTHORIZED);
    httpTesting
      .expectOne(REFRESH_URL)
      .flush({ success: false, message: 'Session expired', code: 'SESSION_REVOKED' }, UNAUTHORIZED);
    await done;
    expect(auth.admin()).toBeNull();
    expect(toast.toasts()).toEqual([]);
    expect(navigate).not.toHaveBeenCalled();
    httpTesting.expectNone(REFRESH_URL);
  });

  it('becomesGuestWithoutRefreshOnNon401', async () => {
    const done = auth.restore();
    httpTesting.expectOne(ME_URL).flush({ success: false, message: 'boom' }, { status: 500, statusText: 'Error' });
    await done;
    expect(auth.admin()).toBeNull();
    expect(toast.toasts()).toEqual([]);
    httpTesting.expectNone(REFRESH_URL);
  });

  it('sharesOneRestoreAcrossCallers', async () => {
    const first = auth.restore();
    const second = auth.restore();
    expect(second).toBe(first);
    httpTesting.expectOne(ME_URL).flush({ success: true, message: 'ok', data: ADMIN });
    await Promise.all([first, second]);
  });
});

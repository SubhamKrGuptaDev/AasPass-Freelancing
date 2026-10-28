import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../config/api.config';
import { authGuard } from '../../guards/auth.guard';
import { authRefreshInterceptor } from '../../interceptors/auth-refresh.interceptor';
import { errorToastInterceptor } from '../../interceptors/error-toast.interceptor';
import { BackendUserResponse } from '../../models/response.model';
import { ToastService } from '../toast/toast.service';
import { AuthService } from './auth.service';

const AMAN: BackendUserResponse = {
  id: 1,
  name: 'Aman Sharma',
  username: 'aman',
  email: 'aman.sharma@example.com',
  city: 'Bengaluru',
  area: 'Indiranagar'
};

const ME_URL = `${API_BASE_URL}/auth/me`;
const LOGIN_URL = `${API_BASE_URL}/auth/login`;
const REGISTER_URL = `${API_BASE_URL}/auth/register`;
const LOGOUT_URL = `${API_BASE_URL}/auth/logout`;
const REFRESH_URL = `${API_BASE_URL}/auth/refresh`;
const UNAUTHORIZED = { status: 401, statusText: 'Unauthorized' };

describe('AuthService', () => {
  let authService: AuthService;
  let httpTesting: HttpTestingController;
  let toast: ToastService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorToastInterceptor, authRefreshInterceptor])),
        provideHttpClientTesting()
      ]
    });
    authService = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
    toast.clear();
    localStorage.clear();
  });

  it('starts as a guest without touching storage', () => {
    expect(authService.currentUser()).toBeNull();
    expect(authService.isLoggedIn()).toBe(false);
    expect(authService.sessionRestored()).toBe(false);
    expect(localStorage.length).toBe(0);
  });

  it('loginSetsUserFromBackendOnly', () => {
    let result: string | undefined;
    authService.login('aman', 'password123').subscribe(u => (result = u.username));

    const req = httpTesting.expectOne(LOGIN_URL);
    expect(req.request.body).toEqual({ usernameOrEmail: 'aman', password: 'password123' });
    req.flush({ success: true, message: 'ok', data: { success: true, message: 'ok', user: AMAN } });

    expect(result).toBe('aman');
    expect(authService.currentUser()?.username).toBe('aman');
    expect(authService.isLoggedIn()).toBe(true);
    expect(toast.toasts().map(t => t.message)).toEqual(['Welcome back, Aman Sharma!']);
    expect(localStorage.length).toBe(0);
  });

  it('loginAndSignupSendPasswordsVerbatim', () => {
    authService.login(' aman ', '  pass word  ').subscribe();
    const login = httpTesting.expectOne(LOGIN_URL);
    expect(login.request.body).toEqual({ usernameOrEmail: 'aman', password: '  pass word  ' });
    login.flush({ success: true, message: 'ok', data: { success: true, message: 'ok', user: AMAN } });

    authService.signup({ name: 'Aman Sharma', username: 'aman', email: 'aman@example.com', password: ' secret12 ' }).subscribe();
    const register = httpTesting.expectOne(REGISTER_URL);
    expect(register.request.body.password).toBe(' secret12 ');
    register.flush({ success: true, message: 'ok', data: { success: true, message: 'ok', user: AMAN } });
  });

  it('loginFailureLeavesGuest', () => {
    let failed = false;
    authService.login('aman', 'wrong').subscribe({ error: () => (failed = true) });

    httpTesting.expectOne(LOGIN_URL)
      .flush({ success: false, message: 'Invalid username or password', code: 'INVALID_CREDENTIALS' }, UNAUTHORIZED);

    expect(failed).toBe(true);
    expect(authService.currentUser()).toBeNull();
    expect(localStorage.length).toBe(0);
    httpTesting.expectNone(REFRESH_URL);
    expect(toast.toasts().map(t => t.message)).toEqual(['Invalid username or password.']);
  });

  it('signupSetsUserFromBackend', () => {
    let name: string | undefined;
    authService.signup({ name: 'Aman Sharma', username: 'Aman', email: 'Aman.Sharma@example.com', password: 'password123' })
      .subscribe(u => (name = u.name));

    const req = httpTesting.expectOne(REGISTER_URL);
    expect(req.request.body.username).toBe('aman');
    expect(req.request.body.email).toBe('aman.sharma@example.com');
    req.flush({ success: true, message: 'ok', data: { success: true, message: 'ok', user: AMAN } });

    expect(name).toBe('Aman Sharma');
    expect(authService.currentUser()?.id).toBe('1');
    expect(toast.toasts().map(t => t.message))
      .toEqual(['Account created successfully! Welcome to AasPass, Aman Sharma!']);
  });

  it('restoreSessionLoadsUser', async () => {
    const restore = authService.restoreSession();
    httpTesting.expectOne(ME_URL).flush({ success: true, message: 'ok', data: AMAN });
    await restore;

    expect(authService.sessionRestored()).toBe(true);
    expect(authService.currentUser()?.username).toBe('aman');
  });

  it('restoreWithExpiredAccessCookieRefreshes', async () => {
    const restore = authService.restoreSession();
    httpTesting.expectOne(ME_URL)
      .flush({ success: false, message: 'Authentication required', code: 'UNAUTHENTICATED' }, UNAUTHORIZED);
    httpTesting.expectOne(REFRESH_URL).flush({ success: true, message: 'Session refreshed', data: AMAN });
    await restore;

    expect(authService.sessionRestored()).toBe(true);
    expect(authService.currentUser()?.username).toBe('aman');
    expect(toast.toasts()).toEqual([]);
  });

  it('restoreGuestRefresh401IsSilent', async () => {
    const navigate = vi.spyOn(router, 'navigate');
    const restore = authService.restoreSession();
    httpTesting.expectOne(ME_URL)
      .flush({ success: false, message: 'Authentication required', code: 'UNAUTHENTICATED' }, UNAUTHORIZED);
    httpTesting.expectOne(REFRESH_URL)
      .flush({ success: false, message: 'Missing refresh token', code: 'UNAUTHENTICATED' }, UNAUTHORIZED);
    await restore;

    expect(authService.sessionRestored()).toBe(true);
    expect(authService.currentUser()).toBeNull();
    expect(toast.toasts()).toEqual([]);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('restoreRefreshServerErrorIsSilentGuest', async () => {
    const navigate = vi.spyOn(router, 'navigate');
    const restore = authService.restoreSession();
    httpTesting.expectOne(ME_URL)
      .flush({ success: false, message: 'Authentication required', code: 'UNAUTHENTICATED' }, UNAUTHORIZED);
    httpTesting.expectOne(REFRESH_URL)
      .flush({ success: false, message: 'down' }, { status: 503, statusText: 'Service Unavailable' });
    await restore;

    expect(authService.currentUser()).toBeNull();
    expect(toast.toasts()).toEqual([]);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('restoreSessionRefreshFailureIsSilentGuest', async () => {
    const navigate = vi.spyOn(router, 'navigate');
    const restore = authService.restoreSession();
    httpTesting.expectOne(ME_URL)
      .flush({ success: false, message: 'expired', code: 'TOKEN_EXPIRED' }, UNAUTHORIZED);
    httpTesting.expectOne(REFRESH_URL)
      .flush({ success: false, message: 'revoked', code: 'SESSION_REVOKED' }, UNAUTHORIZED);
    await restore;

    expect(authService.sessionRestored()).toBe(true);
    expect(authService.currentUser()).toBeNull();
    expect(toast.toasts()).toEqual([]);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('restoreSessionPurgesLegacyStorage', async () => {
    localStorage.setItem('aaspass_auth_user', '{"name":"Aman"}');
    localStorage.setItem('aaspass_auth_token', 'legacy-token');
    localStorage.setItem('aaspass_registered_accounts', '[{"username":"aman","password":"password123"}]');
    localStorage.setItem('unrelated_key', 'keep');

    const restore = authService.restoreSession();
    expect(localStorage.getItem('aaspass_auth_user')).toBeNull();
    expect(localStorage.getItem('aaspass_auth_token')).toBeNull();
    expect(localStorage.getItem('aaspass_registered_accounts')).toBeNull();
    expect(localStorage.getItem('unrelated_key')).toBe('keep');

    httpTesting.expectOne(ME_URL)
      .flush({ success: false, message: 'Authentication required', code: 'UNAUTHENTICATED' }, UNAUTHORIZED);
    httpTesting.expectOne(REFRESH_URL)
      .flush({ success: false, message: 'Missing refresh token', code: 'UNAUTHENTICATED' }, UNAUTHORIZED);
    await restore;
  });

  it('restoreSessionIsMemoised', async () => {
    const first = authService.restoreSession();
    const second = authService.restoreSession();
    expect(second).toBe(first);
    httpTesting.expectOne(ME_URL).flush({ success: true, message: 'ok', data: AMAN });
    await first;
  });

  it('logoutClearsUser', () => {
    authService.setCurrentUser(authService.mapBackendUserToProfile(AMAN));
    expect(authService.isLoggedIn()).toBe(true);

    authService.logout();
    expect(authService.currentUser()).toBeNull();
    expect(authService.isLoggedIn()).toBe(false);

    httpTesting.expectOne(LOGOUT_URL).flush({ success: true, message: 'ok', data: null });
    expect(toast.toasts().map(t => t.message)).toEqual(["You've been logged out."]);
  });

  it('handleSessionEndedRedirectsToLogin', () => {
    authService.setCurrentUser(authService.mapBackendUserToProfile(AMAN));
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    authService.handleSessionEnded();

    expect(authService.currentUser()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/' } });
  });

  it('updateUserProfileUsesCurrentIdAndBackendResponse', () => {
    authService.setCurrentUser(authService.mapBackendUserToProfile(AMAN));
    let updatedName: string | undefined;
    authService.updateUserProfile({ name: 'Aman S', aadharNumber: '123412341234' }).subscribe(u => (updatedName = u.name));

    const req = httpTesting.expectOne(`${API_BASE_URL}/users/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.name).toBe('Aman S');
    expect(req.request.body.aadharNumber).toBeUndefined();
    expect(authService.currentUser()?.name).toBe('Aman Sharma');
    req.flush({ success: true, message: 'ok', data: { ...AMAN, name: 'Aman S' } });

    expect(updatedName).toBe('Aman S');
    expect(authService.currentUser()?.name).toBe('Aman S');
  });

  it('updateKycPutsToMeKyc', () => {
    authService.setCurrentUser(authService.mapBackendUserToProfile(AMAN));
    authService.updateKyc({ panNumber: 'ABCDE1234F' }).subscribe();

    const req = httpTesting.expectOne(`${API_BASE_URL}/users/me/kyc`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ panNumber: 'ABCDE1234F' });
    req.flush({ success: true, message: 'ok', data: { ...AMAN, panNumber: 'XXXXXX234F' } });

    expect(authService.currentUser()?.panNumber).toBe('XXXXXX234F');
  });

  it('manages modal state', () => {
    authService.openLoginModal('/profile');
    expect(authService.isModalOpen()).toBe(true);
    expect(authService.modalMode()).toBe('login');
    expect(authService.returnUrl()).toBe('/profile');

    authService.setModalMode('signup');
    expect(authService.modalMode()).toBe('signup');

    authService.closeModal();
    expect(authService.isModalOpen()).toBe(false);
  });

  describe('authGuard', () => {
    const route = {} as ActivatedRouteSnapshot;

    it('guardWaitsForRestore', async () => {
      let settled = false;
      const result = TestBed.runInInjectionContext(
        () => authGuard(route, { url: '/profile' } as RouterStateSnapshot)
      ) as Promise<boolean | UrlTree>;
      void result.then(() => (settled = true));

      await Promise.resolve();
      await Promise.resolve();
      expect(settled).toBe(false);

      httpTesting.expectOne(ME_URL).flush({ success: true, message: 'ok', data: AMAN });
      await expect(result).resolves.toBe(true);
    });

    it('redirects guests to /login with returnUrl', async () => {
      const result = TestBed.runInInjectionContext(
        () => authGuard(route, { url: '/create-store' } as RouterStateSnapshot)
      ) as Promise<boolean | UrlTree>;

      httpTesting.expectOne(ME_URL)
        .flush({ success: false, message: 'Authentication required', code: 'UNAUTHENTICATED' }, UNAUTHORIZED);
      httpTesting.expectOne(REFRESH_URL)
        .flush({ success: false, message: 'Missing refresh token', code: 'UNAUTHENTICATED' }, UNAUTHORIZED);

      const tree = await result;
      expect(tree instanceof UrlTree).toBe(true);
      expect(router.serializeUrl(tree as UrlTree)).toBe('/login?returnUrl=%2Fcreate-store');
      expect(authService.returnUrl()).toBe('/create-store');
    });
  });

  it('availability checks trim the value and map the response to a boolean', () => {
    const results: boolean[] = [];
    authService.isUsernameAvailable('  aman ').subscribe(v => results.push(v));
    const userReq = httpTesting.expectOne(r => r.url === `${API_BASE_URL}/auth/check-username`);
    expect(userReq.request.params.get('username')).toBe('aman');
    userReq.flush({ success: true, message: 'taken', data: { available: false } });

    authService.isEmailAvailable(' new@example.com ').subscribe(v => results.push(v));
    const emailReq = httpTesting.expectOne(r => r.url === `${API_BASE_URL}/auth/check-email`);
    expect(emailReq.request.params.get('email')).toBe('new@example.com');
    emailReq.flush({ success: true, message: 'free', data: { available: true } });

    expect(results).toEqual([false, true]);
  });

  it('availability check errors on a malformed response instead of reporting "taken"', () => {
    let failed = false;
    authService.isUsernameAvailable('aman').subscribe({ error: () => (failed = true) });
    httpTesting.expectOne(r => r.url === `${API_BASE_URL}/auth/check-username`)
      .flush({ success: true, message: 'ok', data: null });
    expect(failed).toBe(true);
  });
});

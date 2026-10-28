import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../config/api.config';
import { AuthHttpService } from '../services/auth/auth-http.service';
import { AuthService } from '../services/auth/auth.service';
import { ToastService } from '../services/toast/toast.service';
import { authRefreshInterceptor } from './auth-refresh.interceptor';
import { errorToastInterceptor } from './error-toast.interceptor';

const REFRESH_URL = `${API_BASE_URL}/auth/refresh`;
const TOKEN_EXPIRED = { success: false, message: 'Access token expired', code: 'TOKEN_EXPIRED' };
const UNAUTHENTICATED = { success: false, message: 'Authentication required', code: 'UNAUTHENTICATED' };
const USER = { id: 1, name: 'Aman Sharma', username: 'aman', email: 'aman@example.com' };

describe('authRefreshInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let authService: AuthService;
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
    authService = TestBed.inject(AuthService);
    toast = TestBed.inject(ToastService);
  });

  afterEach(() => {
    httpTesting.verify();
    toast.clear();
  });

  it('refreshesOnceForConcurrent401s', () => {
    const results: string[] = [];
    http.get<{ v: string }>(`${API_BASE_URL}/a`).subscribe(r => results.push(r.v));
    http.get<{ v: string }>(`${API_BASE_URL}/b`).subscribe(r => results.push(r.v));

    httpTesting.expectOne(`${API_BASE_URL}/a`).flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne(`${API_BASE_URL}/b`).flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });

    const refreshes = httpTesting.match(REFRESH_URL);
    expect(refreshes.length).toBe(1);
    expect(refreshes[0].request.method).toBe('POST');
    refreshes[0].flush({ success: true, message: 'ok', data: USER });

    httpTesting.expectOne(`${API_BASE_URL}/a`).flush({ v: 'a' });
    httpTesting.expectOne(`${API_BASE_URL}/b`).flush({ v: 'b' });

    expect(results.sort()).toEqual(['a', 'b']);
  });

  it('retriesOnlyOnce', () => {
    const ended = vi.spyOn(authService, 'handleSessionEnded');
    let error: HttpErrorResponse | null = null;
    http.get(`${API_BASE_URL}/a`).subscribe({ error: (e: HttpErrorResponse) => (error = e) });

    httpTesting.expectOne(`${API_BASE_URL}/a`).flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne(REFRESH_URL).flush({ success: true, message: 'ok', data: USER });
    httpTesting.expectOne(`${API_BASE_URL}/a`).flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });

    httpTesting.expectNone(REFRESH_URL);
    expect(error).not.toBeNull();
    expect(error!.status).toBe(401);
    expect(ended).not.toHaveBeenCalled();
  });

  it('refreshServerErrorKeepsUser', () => {
    authService.setCurrentUser(authService.mapBackendUserToProfile(USER));
    const ended = vi.spyOn(authService, 'handleSessionEnded');
    let error: HttpErrorResponse | null = null;
    http.get(`${API_BASE_URL}/a`).subscribe({ error: (e: HttpErrorResponse) => (error = e) });

    httpTesting.expectOne(`${API_BASE_URL}/a`).flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne(REFRESH_URL)
      .flush({ success: false, message: 'down' }, { status: 503, statusText: 'Service Unavailable' });

    expect(ended).not.toHaveBeenCalled();
    expect(authService.currentUser()?.username).toBe('aman');
    expect(error!.status).toBe(503);
    expect(toast.toasts().map(t => t.message)).toEqual(['Something went wrong on our side. Please try again.']);
  });

  it('refreshNetworkErrorKeepsUser', () => {
    authService.setCurrentUser(authService.mapBackendUserToProfile(USER));
    const ended = vi.spyOn(authService, 'handleSessionEnded');
    let error: HttpErrorResponse | null = null;
    http.get(`${API_BASE_URL}/a`).subscribe({ error: (e: HttpErrorResponse) => (error = e) });

    httpTesting.expectOne(`${API_BASE_URL}/a`).flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne(REFRESH_URL).error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(ended).not.toHaveBeenCalled();
    expect(authService.currentUser()?.username).toBe('aman');
    expect(error!.status).toBe(0);
    expect(toast.toasts().map(t => t.message)).toEqual(["Can't reach AasPass right now. Check your connection."]);
  });

  it('sessionRevokedWhileLoggedInEndsSessionWithoutRefresh', () => {
    authService.setCurrentUser(authService.mapBackendUserToProfile(USER));
    const ended = vi.spyOn(authService, 'handleSessionEnded');
    let error: HttpErrorResponse | null = null;
    http.get(`${API_BASE_URL}/users/me`).subscribe({ error: (e: HttpErrorResponse) => (error = e) });

    httpTesting.expectOne(`${API_BASE_URL}/users/me`)
      .flush({ success: false, message: 'revoked', code: 'SESSION_REVOKED' }, { status: 401, statusText: 'Unauthorized' });

    httpTesting.expectNone(REFRESH_URL);
    expect(ended).toHaveBeenCalledTimes(1);
    expect(authService.currentUser()).toBeNull();
    expect(error!.status).toBe(401);
    expect((error!.error as { code?: string }).code).toBe('SESSION_REVOKED');
  });

  it('doesNotRefreshAuthEndpoints', () => {
    let error: HttpErrorResponse | null = null;
    TestBed.inject(AuthHttpService)
      .login({ usernameOrEmail: 'aman', password: 'wrong' })
      .subscribe({ error: (e: HttpErrorResponse) => (error = e) });

    httpTesting.expectOne(`${API_BASE_URL}/auth/login`)
      .flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });

    httpTesting.expectNone(REFRESH_URL);
    expect(error!.status).toBe(401);
  });

  it('doesNotRefreshUnauthenticatedForGuests', () => {
    let error: HttpErrorResponse | null = null;
    http.get(`${API_BASE_URL}/users/me`).subscribe({ error: (e: HttpErrorResponse) => (error = e) });

    httpTesting.expectOne(`${API_BASE_URL}/users/me`).flush(UNAUTHENTICATED, { status: 401, statusText: 'Unauthorized' });

    httpTesting.expectNone(REFRESH_URL);
    expect(error!.status).toBe(401);
  });

  it('refreshesUnauthenticatedWhenLoggedIn', () => {
    authService.setCurrentUser(authService.mapBackendUserToProfile(USER));
    let body: unknown = null;
    http.get(`${API_BASE_URL}/users/me`).subscribe(r => (body = r));

    httpTesting.expectOne(`${API_BASE_URL}/users/me`).flush(UNAUTHENTICATED, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne(REFRESH_URL).flush({ success: true, message: 'ok', data: USER });
    httpTesting.expectOne(`${API_BASE_URL}/users/me`).flush({ ok: true });

    expect(body).toEqual({ ok: true });
  });

  it('refreshFailureEndsSession', () => {
    const ended = vi.spyOn(authService, 'handleSessionEnded');
    let error: HttpErrorResponse | null = null;
    http.get(`${API_BASE_URL}/a`).subscribe({ error: (e: HttpErrorResponse) => (error = e) });

    httpTesting.expectOne(`${API_BASE_URL}/a`).flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne(REFRESH_URL)
      .flush({ success: false, message: 'revoked', code: 'SESSION_REVOKED' }, { status: 401, statusText: 'Unauthorized' });

    expect(ended).toHaveBeenCalledTimes(1);
    expect(error!.status).toBe(401);
    expect((error!.error as { code?: string }).code).toBe('TOKEN_EXPIRED');
  });

  it('refresh401WhileLoggedInShowsOnlyTheSessionEndedToast', () => {
    authService.setCurrentUser(authService.mapBackendUserToProfile(USER));
    let error: HttpErrorResponse | null = null;
    http.get(`${API_BASE_URL}/users/me`).subscribe({ error: (e: HttpErrorResponse) => (error = e) });

    httpTesting.expectOne(`${API_BASE_URL}/users/me`).flush(UNAUTHENTICATED, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne(REFRESH_URL)
      .flush({ success: false, message: 'Invalid refresh token', code: 'UNAUTHENTICATED' }, { status: 401, statusText: 'Unauthorized' });

    expect(error!.status).toBe(401);
    expect(authService.currentUser()).toBeNull();
    expect(toast.toasts().map(t => t.message)).toEqual(['Your session has ended. Please log in again.']);
  });

  it('publicGetRecoversAfterRefresh', () => {
    let body: unknown = null;
    http.get(`${API_BASE_URL}/stores`).subscribe(r => (body = r));

    httpTesting.expectOne(`${API_BASE_URL}/stores`).flush(TOKEN_EXPIRED, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne(REFRESH_URL).flush({ success: true, message: 'ok', data: USER });
    httpTesting.expectOne(`${API_BASE_URL}/stores`).flush({ success: true, message: 'ok', data: [] });

    expect(body).toEqual({ success: true, message: 'ok', data: [] });
  });

  it('noToastWhenRefreshSucceeds', () => {
    authService.setCurrentUser(authService.mapBackendUserToProfile(USER));
    http.get(`${API_BASE_URL}/a`).subscribe();

    httpTesting.expectOne(`${API_BASE_URL}/a`).flush(UNAUTHENTICATED, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne(REFRESH_URL).flush({ success: true, message: 'ok', data: USER });
    httpTesting.expectOne(`${API_BASE_URL}/a`).flush({ ok: true });

    expect(toast.toasts()).toEqual([]);
  });
});

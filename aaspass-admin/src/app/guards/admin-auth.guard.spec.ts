import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { adminAuthGuard, loginRedirectGuard } from './admin-auth.guard';

describe('admin guards', () => {
  let auth: AdminAuthService;
  let router: Router;
  const route = {} as ActivatedRouteSnapshot;
  const state = (url: string) => ({ url }) as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    auth = TestBed.inject(AdminAuthService);
    router = TestBed.inject(Router);
    vi.spyOn(auth, 'restore').mockResolvedValue();
  });

  it('redirectsGuestToLoginWithReturnUrl', async () => {
    const result = await TestBed.runInInjectionContext(() => adminAuthGuard(route, state('/users')));
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fusers');
  });

  it('allowsAuthenticatedAdmin', async () => {
    auth.admin.set({ id: 1, name: 'Root', email: 'a@b.c' });
    const result = await TestBed.runInInjectionContext(() => adminAuthGuard(route, state('/users')));
    expect(result).toBe(true);
  });

  it('loginRedirectSendsSignedInAdminToDashboard', async () => {
    auth.admin.set({ id: 1, name: 'Root', email: 'a@b.c' });
    const result = await TestBed.runInInjectionContext(() => loginRedirectGuard(route, state('/login')));
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });

  it('loginRedirectAllowsGuest', async () => {
    const result = await TestBed.runInInjectionContext(() => loginRedirectGuard(route, state('/login')));
    expect(result).toBe(true);
  });
});

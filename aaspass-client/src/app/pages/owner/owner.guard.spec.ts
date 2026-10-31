import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { StoreService } from '../../services/store/store.service';
import { ownerGuard } from './owner.guard';

function run(opts: { loggedIn: boolean; stores: unknown[] }): Promise<boolean | UrlTree> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: AuthService,
        useValue: { restoreSession: async () => undefined, isLoggedIn: signal(opts.loggedIn), returnUrl: signal('') }
      },
      { provide: StoreService, useValue: { userStores: signal(opts.stores) } }
    ]
  });
  return TestBed.runInInjectionContext(
    () => ownerGuard({} as ActivatedRouteSnapshot, { url: '/owner-dashboard/availability' } as RouterStateSnapshot)
  ) as Promise<boolean | UrlTree>;
}

describe('ownerGuard', () => {
  it('redirects a signed-in non-owner to /create-store', async () => {
    const result = await run({ loggedIn: true, stores: [] });
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/create-store');
  });

  it('allows an owner', async () => {
    expect(await run({ loggedIn: true, stores: [{ id: '1' }] })).toBe(true);
  });

  it('sends a guest to /login with the return url', async () => {
    const result = await run({ loggedIn: false, stores: [] });
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toContain('/login?returnUrl=');
  });
});

import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

/**
 * Protects every admin page. It awaits the startup session check so a reload never bounces a
 * signed-in admin, then sends guests to /login with the target URL as returnUrl.
 */
export const adminAuthGuard: CanActivateFn = async (_route, state): Promise<boolean | UrlTree> => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  await auth.restore();
  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state?.url || '/dashboard' } });
};

/** Keeps signed-in admins off the login page. */
export const loginRedirectGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  await auth.restore();
  return auth.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};

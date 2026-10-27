import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Route guard for protected pages (e.g. /profile, /create-store).
 * It first awaits the startup cookie-session check (the same memoised restoreSession() promise the app
 * initializer uses), so a reload never bounces a signed-in user to /login. When the user is a guest:
 * 1. It records the target destination as returnUrl.
 * 2. It redirects to the dedicated /login page with that returnUrl as a query parameter.
 * 3. After a successful login/signup, the auth page navigates back to the protected URL.
 */
export const authGuard: CanActivateFn = async (_route, state): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.restoreSession();

  if (authService.isLoggedIn()) {
    return true;
  }

  // Record target return URL safely
  const targetUrl = state?.url || '/';
  authService.returnUrl.set(targetUrl);

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: targetUrl } });
};

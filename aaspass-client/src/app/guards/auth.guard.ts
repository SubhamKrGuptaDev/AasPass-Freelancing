import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Route guard that ensures the user is authenticated with username and password.
 * When an unauthenticated user attempts to access a protected URL (e.g. /profile, /create-store):
 * 1. It records the target destination as returnUrl.
 * 2. It triggers the interactive Login Popup Modal so the user can log in or sign up.
 * 3. Upon successful login/signup, the user is automatically navigated to the protected URL.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Trigger login popup modal with requested return URL
  authService.openLoginModal(state.url);

  // On direct/first URL navigation, redirect router safely to Home so it is not left on a blank outlet
  if (!router.navigated) {
    return router.createUrlTree(['/']);
  }

  return false;
};

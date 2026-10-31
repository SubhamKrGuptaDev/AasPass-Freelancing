import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { StoreService } from '../../services/store/store.service';

/**
 * Owner-only pages: requires login (same flow as {@link authGuard}), then at least one owned store;
 * a signed-in user with no store is sent to /create-store.
 */
export const ownerGuard: CanActivateFn = async (route, state) => {
  // Injections must happen before the first await.
  const stores = inject(StoreService);
  const router = inject(Router);
  const authResult = await (authGuard(route, state) as Promise<boolean | UrlTree>);
  if (authResult !== true) {
    return authResult;
  }
  const owned = stores.userStores() ?? [];
  return owned.length > 0 ? true : router.createUrlTree(['/create-store']);
};

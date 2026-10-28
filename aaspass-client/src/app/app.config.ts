import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { errorToastInterceptor } from './interceptors/error-toast.interceptor';
import { authRefreshInterceptor } from './interceptors/auth-refresh.interceptor';
import { AuthService } from './services/auth/auth.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      // Order matters: errorToastInterceptor is outermost, so it only sees errors left after refresh-and-retry.
      withInterceptors([errorToastInterceptor, authRefreshInterceptor])
    ),
    // Restore the cookie session before the first navigation; resolves as guest on any failure.
    provideAppInitializer(() => inject(AuthService).restoreSession())
  ]
};

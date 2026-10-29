import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { routes } from './app.routes';
import { authRefreshInterceptor } from './interceptors/auth-refresh.interceptor';
import { errorToastInterceptor } from './interceptors/error-toast.interceptor';
import { AdminAuthService } from './services/admin-auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withInterceptors([errorToastInterceptor, authRefreshInterceptor])
    ),
    provideAppInitializer(() => inject(AdminAuthService).restore())
  ]
};

import { HttpClient, HttpContext } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, map, shareReplay, tap } from 'rxjs';
import { SKIP_ERROR_TOAST } from '../interceptors/http-context';
import { AdminProfile, ApiResponse } from '../models/admin.models';
import { ToastService } from './toast.service';

const AUTH_URL = '/api/admin/auth';
export const SESSION_ENDED_MESSAGE = 'Your session has ended. Please log in again.';

/** Holds the signed-in administrator (cookie session) and runs login, logout, refresh and restore. */
@Service()
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly admin = signal<AdminProfile | null>(null);
  readonly isAuthenticated = computed(() => this.admin() !== null);

  private restorePromise: Promise<void> | null = null;
  private refreshInFlight$: Observable<AdminProfile> | null = null;

  /** Checks the cookie session once per app load; a failure simply means "guest". */
  restore(): Promise<void> {
    if (!this.restorePromise) {
      this.restorePromise = new Promise<void>((resolve) => {
        this.http
          .get<ApiResponse<AdminProfile>>(`${AUTH_URL}/me`, {
            context: new HttpContext().set(SKIP_ERROR_TOAST, true)
          })
          .subscribe({
            next: (res) => {
              this.admin.set(res?.data ?? null);
              resolve();
            },
            error: () => {
              this.admin.set(null);
              resolve();
            }
          });
      });
    }
    return this.restorePromise;
  }

  login(email: string, password: string): Observable<AdminProfile> {
    return this.http.post<ApiResponse<AdminProfile>>(`${AUTH_URL}/login`, { email, password }).pipe(
      map((res) => res.data),
      tap((profile) => this.admin.set(profile))
    );
  }

  /** Always clears the local session, even when the server call fails. */
  logout(): Observable<void> {
    return this.http.post<ApiResponse<null>>(`${AUTH_URL}/logout`, {}).pipe(
      map(() => undefined),
      finalize(() => this.admin.set(null))
    );
  }

  /** Renews the access cookie. Concurrent callers share one in-flight request. */
  refresh(): Observable<AdminProfile> {
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.http
        .post<ApiResponse<AdminProfile>>(`${AUTH_URL}/refresh`, {}, {
          context: new HttpContext().set(SKIP_ERROR_TOAST, true)
        })
        .pipe(
          map((res) => res.data),
          tap((profile) => {
            if (profile) {
              this.admin.set(profile);
            }
          }),
          finalize(() => {
            this.refreshInFlight$ = null;
          }),
          shareReplay({ bufferSize: 1, refCount: false })
        );
    }
    return this.refreshInFlight$;
  }

  /** The server ended the session: drop local state, tell the admin and go to the login page. */
  handleSessionEnded(): void {
    this.admin.set(null);
    this.toast.warning(SESSION_ENDED_MESSAGE);
    void this.router.navigate(['/login']);
  }
}

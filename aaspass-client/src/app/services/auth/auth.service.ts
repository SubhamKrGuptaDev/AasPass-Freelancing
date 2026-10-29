import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, firstValueFrom, map, tap, throwError, timeout } from 'rxjs';
import { SignupRequest, UserProfile, getRandomAvatarUrl } from '../../models/user.model';
import { ApiResponse, BackendAvailabilityResponse, BackendUserResponse } from '../../models/response.model';
import { KycUpdatePayload } from '../../models/request.model';
import { ToastService } from '../toast/toast.service';
import { errorCode } from '../../interceptors/error-toast.interceptor';
import { AuthHttpService } from './auth-http.service';
import { SessionRefreshService } from './session-refresh.service';
import { DEFAULT_COUNTRY } from '../../geo/country';

/** Upper bound for the startup session check so a hung backend never blocks bootstrap. */
const RESTORE_TIMEOUT_MS = 10_000;

/** localStorage keys used by builds before cookie auth; purged on startup. */
const LEGACY_STORAGE_KEYS = ['aaspass_auth_user', 'aaspass_auth_token', 'aaspass_registered_accounts'] as const;

/**
 * Holds the signed-in user. Auth state comes only from backend responses: the session itself lives in
 * HttpOnly cookies, so nothing is persisted client-side. On startup {@link restoreSession} asks
 * GET /auth/me and, when the access cookie is gone or expired, renews the session once through the
 * shared refresh; any failure means guest.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly authHttpService = inject(AuthHttpService);
  private readonly sessionRefresh = inject(SessionRefreshService);
  private readonly toast = inject(ToastService);

  private readonly _currentUser = signal<UserProfile | null>(null);
  /** Active authenticated user (null when guest / unauthenticated). */
  readonly currentUser = this._currentUser.asReadonly();

  // Reactive logged-in state
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  private readonly _sessionRestored = signal<boolean>(false);
  /** True once the startup session check has finished, whatever its outcome. */
  readonly sessionRestored = this._sessionRestored.asReadonly();
  private restorePromise: Promise<void> | null = null;

  // Modal / Popup state
  readonly isModalOpen = signal<boolean>(false);
  readonly modalMode = signal<'login' | 'signup'>('login');
  readonly returnUrl = signal<string | null>(null);

  /**
   * Restores the cookie session once per app; every caller (app initializer, guard) awaits the same
   * promise. A 401 UNAUTHENTICATED from GET /auth/me (the browser already dropped the expired access
   * cookie) runs the shared refresh once and takes the user from its response; an expired-but-present
   * access cookie (TOKEN_EXPIRED) is renewed by the refresh interceptor instead. Never rejects: any
   * failure, including a rejected or failed refresh, leaves the app as a silent guest (no toast, no redirect).
   */
  restoreSession(): Promise<void> {
    if (!this.restorePromise) {
      this.purgeLegacyStorage();
      this.restorePromise = firstValueFrom(
        this.authHttpService.me().pipe(
          catchError((err: unknown) => {
            if (err instanceof HttpErrorResponse && err.status === 401 && errorCode(err) === 'UNAUTHENTICATED') {
              return this.sessionRefresh.refresh();
            }
            return throwError(() => err);
          }),
          timeout({ first: RESTORE_TIMEOUT_MS })
        ),
        { defaultValue: null }
      )
        .then(resp => {
          this._currentUser.set(resp?.data ? this.mapBackendUserToProfile(resp.data) : null);
        })
        .catch(() => {
          this._currentUser.set(null);
        })
        .finally(() => {
          this._sessionRestored.set(true);
        });
    }
    return this.restorePromise;
  }

  /** Maps the backend UserResponse DTO to the frontend UserProfile. */
  mapBackendUserToProfile(u: BackendUserResponse): UserProfile {
    return {
      id: String(u.id ?? ''),
      name: u.name || '',
      username: u.username || '',
      email: u.email || '',
      phone: u.phone || '+91 98000 00000',
      aadharNumber: u.aadharNumber,
      panNumber: u.panNumber,
      avatarUrl: (u.avatarUrl && u.avatarUrl.trim()) ? u.avatarUrl.trim() : getRandomAvatarUrl(u.username || u.name || String(u.id ?? '')),
      profilePictureUrl: u.profilePictureUrl || undefined,
      city: u.city || 'Bengaluru',
      area: u.area || 'Indiranagar',
      country: u.country || DEFAULT_COUNTRY,
      bio: u.bio || '',
      memberSince: u.memberSince || 'March 2026',
      hasStore: Boolean(u.hasStore),
      stores: (u.stores || []).filter(Boolean).map(s => ({
        id: String(s.id ?? ''),
        userId: String(s.userId || u.id || ''),
        ownerName: s.ownerName || u.name || '',
        storeName: s.storeName || '',
        tagline: s.tagline || '',
        category: s.category || '',
        skills: s.skills || [],
        experienceYears: s.experienceYears || 0,
        hourlyRate: s.hourlyRate || 0,
        startingPrice: s.startingPrice || 0,
        area: s.area || u.area || 'Indiranagar',
        city: s.city || u.city || 'Bengaluru',
        country: s.country || DEFAULT_COUNTRY,
        googleMapLink: s.googleMapLink || undefined,
        serviceRadiusKm: s.serviceRadiusKm || 10,
        socialMediaLinks: (s.socialMediaLinks || []).filter(Boolean).map(l => ({ id: String(l.id || l.name || 'link'), name: l.name || '', url: l.url || '' })),
        storeSocialMediaLinks: s.storeSocialMediaLinks,
        userSocialLinks: s.storeSocialMediaLinks,
        description: s.description || '',
        services: (s.services || []).filter(Boolean).map(sv => ({
          id: String(sv.id ?? 'service'),
          name: sv.name || '',
          price: sv.price || 0,
          duration: sv.duration || '',
          description: sv.description || ''
        })),
        rating: s.rating || 5.0,
        reviewCount: s.reviewCount || 0,
        reviews: (s.reviews || []).filter(Boolean).map(r => ({
          id: String(r.id ?? 'rev'),
          storeId: String(s.id ?? ''),
          userName: r.userName || 'Anonymous',
          rating: r.rating || 5.0,
          message: r.message || '',
          date: r.reviewDate || 'Recently'
        })),
        views: {
          daily: s.views?.daily ?? 1,
          weekly: s.views?.weekly ?? 1,
          monthly: s.views?.monthly ?? 1,
          lifetime: s.views?.lifetime ?? 1
        },
        avatarUrl: s.avatarUrl || u.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
        ownerProfilePictureUrl: s.ownerProfilePictureUrl || u.profilePictureUrl || undefined,
        bannerGradient: s.bannerGradient || 'from-indigo-500 to-purple-600',
        isAvailable: s.isAvailable !== false,
        isActive: s.isActive === true,
        memberSince: s.memberSince || u.memberSince || 'March 2026',
        creationDateTime: s.creationDateTime || new Date().toISOString(),
        lastUpdateDateTime: s.lastUpdateDateTime || new Date().toISOString()
      })),
      userSocialMediaLinks: u.userSocialMediaLinks,
      socialMediaLinks: (u.socialMediaLinks || []).filter(Boolean).map(l => ({ id: String(l.id || l.name || 'link'), name: l.name || '', url: l.url || '' })),
      userSocialLinks: u.userSocialMediaLinks,
      creationDateTime: u.creationDateTime || new Date().toISOString(),
      lastUpdateDateTime: u.lastUpdateDateTime || new Date().toISOString()
    };
  }

  /** Signs in via POST /auth/login; the user is set only from the backend response. */
  login(usernameOrEmail: string, password: string): Observable<UserProfile> {
    return this.authHttpService.login({
      usernameOrEmail: (usernameOrEmail ?? '').trim(),
      // Passwords are sent verbatim: surrounding spaces are part of the secret.
      password: password ?? ''
    }).pipe(
      map(resp => this.profileFromAuthResponse(resp?.data?.user)),
      tap(profile => {
        this.completeAuthentication(profile);
        this.toast.success(`Welcome back, ${profile.name}!`);
      })
    );
  }

  /** Asks GET /auth/check-username whether no account uses the username yet. */
  isUsernameAvailable(username: string): Observable<boolean> {
    return this.authHttpService.checkUsername((username ?? '').trim()).pipe(map(availableFrom));
  }

  /** Asks GET /auth/check-email whether no account uses the email yet. */
  isEmailAvailable(email: string): Observable<boolean> {
    return this.authHttpService.checkEmail((email ?? '').trim()).pipe(map(availableFrom));
  }

  /** Registers via POST /auth/register (which also signs the user in); the user comes from the response. */
  signup(request: SignupRequest): Observable<UserProfile> {
    const name = (request.name ?? '').trim();
    const rawUsername = (request.username || (request.usernameOrEmail && !request.usernameOrEmail.includes('@') ? request.usernameOrEmail : '')).trim();
    const rawEmail = (request.email || (request.usernameOrEmail && request.usernameOrEmail.includes('@') ? request.usernameOrEmail : '')).trim();

    // Determine username & email with backward-compatible fallback
    const username = rawUsername || (rawEmail ? rawEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : (request.usernameOrEmail ?? '').trim());
    const email = rawEmail || (username ? (username.includes('@') ? username : `${username}@aaspass.local`) : '');
    const avatar = request.avatarUrl?.trim() ? request.avatarUrl.trim() : getRandomAvatarUrl(username || name);

    return this.authHttpService.register({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: request.password ?? '',
      phone: (request.phone ?? '').trim() || '+91 98000 00000',
      city: request.city || 'Bengaluru',
      area: request.area || 'Indiranagar',
      country: (request.country || DEFAULT_COUNTRY).trim(),
      avatarUrl: avatar
    }).pipe(
      map(resp => this.profileFromAuthResponse(resp?.data?.user)),
      tap(profile => {
        this.completeAuthentication(profile);
        this.toast.success(`Account created successfully! Welcome to AasPass, ${profile.name}!`);
      })
    );
  }

  /**
   * Saves general profile fields via PUT /users/{id} (KYC goes through {@link updateKyc}).
   * The current user is replaced only with the backend response; nothing is applied optimistically.
   */
  updateUserProfile(updated: Partial<UserProfile>): Observable<UserProfile> {
    const current = this._currentUser();
    if (!current?.id) {
      return throwError(() => new Error('Cannot update profile: no signed-in user.'));
    }
    const merged: UserProfile = { ...current, ...updated };
    return this.authHttpService.updateUser(current.id, {
      name: merged.name,
      phone: merged.phone,
      avatarUrl: merged.avatarUrl,
      city: merged.city,
      area: merged.area,
      country: merged.country,
      bio: merged.bio,
      userSocialMediaLinks: merged.userSocialMediaLinks,
      socialMediaLinks: merged.socialMediaLinks
    }).pipe(
      map(resp => this.profileFromUserResponse(resp)),
      tap(profile => this._currentUser.set(profile))
    );
  }

  /** Updates Aadhaar / PAN via PUT /users/me/kyc; the response carries the masked values. */
  updateKyc(payload: KycUpdatePayload): Observable<UserProfile> {
    return this.authHttpService.updateKyc(payload).pipe(
      map(resp => this.profileFromUserResponse(resp)),
      tap(profile => this._currentUser.set(profile))
    );
  }

  /** Uploads a (pre-resized) profile picture; the current user gets the new versioned URL from the backend. */
  uploadProfilePicture(image: Blob, fileName: string): Observable<string | undefined> {
    return this.authHttpService.uploadProfilePicture(image, fileName).pipe(
      map(resp => resp?.data?.profilePictureUrl || undefined),
      tap(url => this.applyProfilePicture(url))
    );
  }

  /** Removes the uploaded profile picture; the generated avatar is shown again everywhere. */
  removeProfilePicture(): Observable<void> {
    return this.authHttpService.deleteProfilePicture().pipe(
      map(() => undefined),
      tap(() => this.applyProfilePicture(undefined))
    );
  }

  /** Puts the picture URL on the current user and on the stores they own. */
  private applyProfilePicture(url: string | undefined): void {
    const current = this._currentUser();
    if (!current) return;
    this._currentUser.set({
      ...current,
      profilePictureUrl: url,
      stores: current.stores?.map(s => ({ ...s, ownerProfilePictureUrl: url }))
    });
  }

  /** Replaces the in-memory current user (e.g. after a store change confirmed by the backend). */
  setCurrentUser(user: UserProfile | null): void {
    this._currentUser.set(user);
  }

  /** Logs out via POST /auth/logout (server revokes the session and clears cookies) and resets to guest. */
  logout(): void {
    this.authHttpService.logout().subscribe({
      error: () => {
        // Local state is cleared regardless; a session the server could not revoke still expires on its own.
      }
    });
    this._currentUser.set(null);
    this.closeModal();
    this.toast.success("You've been logged out.");
    void this.router.navigate(['/']);
  }

  /**
   * Called when a silent refresh fails. Clears the user and, only if a user was signed in and the app is
   * not already on /login, sends them to /login with the current URL as returnUrl. A guest (for example
   * during the startup session check) is left alone, so restore never redirects or loops.
   */
  handleSessionEnded(): void {
    const wasLoggedIn = this.isLoggedIn();
    this._currentUser.set(null);
    if (!wasLoggedIn) {
      return;
    }
    this.toast.warning('Your session has ended. Please log in again.');
    const currentUrl = this.router.url || '/';
    const currentPath = currentUrl.split(/[?#]/)[0];
    if (currentPath === '/login') {
      return;
    }
    void this.router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
  }

  /**
   * Removes auth data written by older builds (cached user, token and a local account list that held
   * plaintext passwords). Auth state now lives only in HttpOnly cookies.
   */
  private purgeLegacyStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      for (const key of LEGACY_STORAGE_KEYS) {
        localStorage.removeItem(key);
      }
    } catch {
      // Storage can be unavailable (privacy mode, blocked site data); nothing to purge then.
    }
  }

  private profileFromAuthResponse(user: BackendUserResponse | null | undefined): UserProfile {
    if (!user) {
      throw new Error('Authentication response did not include a user.');
    }
    return this.mapBackendUserToProfile(user);
  }

  private profileFromUserResponse(resp: ApiResponse<BackendUserResponse> | null | undefined): UserProfile {
    if (!resp?.data) {
      throw new Error('User response did not include a user.');
    }
    return this.mapBackendUserToProfile(resp.data);
  }

  private completeAuthentication(profile: UserProfile): void {
    this._currentUser.set(profile);
    this.isModalOpen.set(false);
    this.returnUrl.set(null);
  }

  // Modal / Popup controls
  openLoginModal(returnUrl?: string): void {
    this.modalMode.set('login');
    if (returnUrl) {
      this.returnUrl.set(returnUrl);
    }
    this.isModalOpen.set(true);
  }

  openSignupModal(returnUrl?: string): void {
    this.modalMode.set('signup');
    if (returnUrl) {
      this.returnUrl.set(returnUrl);
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  setModalMode(mode: 'login' | 'signup'): void {
    this.modalMode.set(mode);
  }
}

/** Reads `available` from an availability response; a malformed body is an error, never "taken". */
function availableFrom(resp: ApiResponse<BackendAvailabilityResponse> | null | undefined): boolean {
  const available = resp?.data?.available;
  if (typeof available !== 'boolean') {
    throw new Error('Malformed availability response');
  }
  return available;
}

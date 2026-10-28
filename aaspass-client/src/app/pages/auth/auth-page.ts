import { Component, computed, inject, signal, OnInit, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Observable, catchError, defaultIfEmpty, forkJoin, of, tap } from 'rxjs';
import { UserProfile, getRandomAvatarUrl } from '../../models/user.model';

/** Result of the live signup availability check for one field. */
export type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

@Component({
  selector: 'app-auth-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css'
})
export class AuthPageComponent implements OnInit {
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  mode = signal<'login' | 'signup'>('login');
  /** Client-side validation message only; server errors are shown as toasts by the error interceptor. */
  readonly formError = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  isLoginMode = computed(() => this.mode() === 'login');

  loginInput = '';
  loginPassword = '';
  showPassword = signal<boolean>(false);

  signupName = '';
  signupUsername = '';
  signupEmail = '';
  signupCountry = 'India';
  signupCity = 'Bengaluru';
  signupArea = 'Indiranagar';
  signupPassword = '';
  signupConfirmPassword = '';
  signupAvatarUrl = '';
  getRandomAvatarUrl = getRandomAvatarUrl;

  readonly usernameStatus = signal<AvailabilityStatus>('idle');
  readonly emailStatus = signal<AvailabilityStatus>('idle');

  readonly availableCountries = [
    'India',
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'United Arab Emirates',
    'Singapore'
  ];

  randomizeSignupAvatar(): void {
    const randomSeed = 'user-' + Math.random().toString(36).substring(2, 9);
    this.signupAvatarUrl = getRandomAvatarUrl(randomSeed);
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profile']);
      return;
    }

    const path = this.route.snapshot.routeConfig?.path;
    if (path === 'signup') {
      this.mode.set('signup');
    } else {
      this.mode.set('login');
    }
  }

  setMode(mode: 'login' | 'signup'): void {
    this.mode.set(mode);
    this.formError.set(null);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  private resolveReturnUrl(): string {
    const fromQuery: unknown = this.route.snapshot.queryParams['returnUrl'];
    return (typeof fromQuery === 'string' && fromQuery) || this.authService.returnUrl() || '/profile';
  }

  private submit(request$: Observable<UserProfile>): void {
    // Read before subscribing: a successful login clears the service-held returnUrl.
    const returnUrl = this.resolveReturnUrl();
    this.isSubmitting.set(true);
    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        // The error interceptor already shows a toast (invalid credentials, duplicate username, ...).
        this.isSubmitting.set(false);
      }
    });
  }

  onLoginSubmit(event: Event): void {
    event.preventDefault();
    this.formError.set(null);
    if (this.isSubmitting()) return;

    if (!this.loginInput.trim()) {
      this.formError.set('Please enter your username or email address.');
      return;
    }
    if (!this.loginPassword.trim()) {
      this.formError.set('Please enter your password.');
      return;
    }

    this.submit(this.authService.login(this.loginInput, this.loginPassword));
  }

  /** Editing a field invalidates its last availability result. */
  onSignupUsernameChange(): void {
    this.usernameStatus.set('idle');
  }

  onSignupEmailChange(): void {
    this.emailStatus.set('idle');
  }

  onSignupUsernameBlur(): void {
    const username = this.signupUsername.trim();
    if (username.length < 3) return;
    this.checkUsername(username).subscribe();
  }

  onSignupEmailBlur(): void {
    const email = this.signupEmail.trim();
    if (!email.includes('@')) return;
    this.checkEmail(email).subscribe();
  }

  private checkUsername(username: string): Observable<boolean | null> {
    return this.trackAvailability(this.authService.isUsernameAvailable(username), this.usernameStatus,
      () => this.signupUsername.trim() === username);
  }

  private checkEmail(email: string): Observable<boolean | null> {
    return this.trackAvailability(this.authService.isEmailAvailable(email), this.emailStatus,
      () => this.signupEmail.trim() === email);
  }

  /**
   * Runs an availability check and records the result in {@code status}, unless the field changed
   * meanwhile ({@code isCurrent}). Emits availability, or null when unknown (request failed or
   * produced nothing); POST /auth/register still enforces uniqueness either way.
   */
  private trackAvailability(check$: Observable<boolean>, status: WritableSignal<AvailabilityStatus>,
                            isCurrent: () => boolean): Observable<boolean | null> {
    status.set('checking');
    return check$.pipe(
      tap(available => {
        if (isCurrent()) status.set(available ? 'available' : 'taken');
      }),
      catchError(() => {
        if (isCurrent()) status.set('error');
        return of(null);
      }),
      defaultIfEmpty(null)
    );
  }

  onSignupSubmit(event: Event): void {
    event.preventDefault();
    this.formError.set(null);
    if (this.isSubmitting()) return;

    if (this.signupName.trim().length < 2) {
      this.formError.set('Please provide your full name (minimum 2 characters).');
      return;
    }

    if (this.signupUsername.trim().length < 3) {
      this.formError.set('Please provide a username with at least 3 characters.');
      return;
    }

    if (!this.signupEmail.includes('@')) {
      this.formError.set('Please enter a valid email address.');
      return;
    }

    if (this.signupPassword.trim().length < 6) {
      this.formError.set('Password must be at least 6 characters long.');
      return;
    }

    if (this.signupPassword !== this.signupConfirmPassword) {
      this.formError.set('Passwords do not match. Please re-enter your password.');
      return;
    }

    // Re-check right before submitting: the blur result may be stale or never have run.
    const username = this.signupUsername.trim();
    const email = this.signupEmail.trim();
    this.isSubmitting.set(true);
    forkJoin({ usernameFree: this.checkUsername(username), emailFree: this.checkEmail(email) })
      .subscribe(({ usernameFree, emailFree }) => {
        if (usernameFree === false || emailFree === false) {
          this.isSubmitting.set(false);
          this.formError.set(usernameFree === false
            ? 'This username is already taken. Please choose another.'
            : 'An account with this email already exists. Try signing in instead.');
          return;
        }
        // Unknown (null) results fall through: POST /auth/register rejects duplicates itself.
        this.submitSignup(username, email);
      });
  }

  private submitSignup(username: string, email: string): void {
    this.submit(this.authService.signup({
      name: this.signupName,
      username,
      email,
      country: this.signupCountry,
      city: this.signupCity,
      area: this.signupArea,
      password: this.signupPassword,
      avatarUrl: this.signupAvatarUrl
    }));
  }
}

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { Component, computed, inject, signal, OnInit, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CountryPickerComponent } from '../../components/location-picker/country-picker';
import { CityPickerComponent } from '../../components/location-picker/city-picker';
import { AuthService } from '../../services/auth/auth.service';
import { Observable, catchError, defaultIfEmpty, forkJoin, of, tap } from 'rxjs';
import { UserProfile, getRandomAvatarUrl } from '../../models/user.model';
import { matchingFields, minTrimmedLength, notBlank } from '../../forms/validators';
import { DEFAULT_COUNTRY } from '../../geo/country';

/** Result of the live signup availability check for one field. */
export type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule, RouterLink, CountryPickerComponent, CityPickerComponent, NgIcon],
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
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

  readonly loginForm = new FormGroup({
    identifier: new FormControl('', { nonNullable: true, validators: [notBlank] }),
    password: new FormControl('', { nonNullable: true, validators: [notBlank] })
  });
  showPassword = signal<boolean>(false);

  readonly signupForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [minTrimmedLength(2)] }),
    username: new FormControl('', { nonNullable: true, validators: [minTrimmedLength(3)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/@/)] }),
    country: new FormControl(DEFAULT_COUNTRY, { nonNullable: true }),
    city: new FormControl('Bengaluru', { nonNullable: true }),
    area: new FormControl('Indiranagar', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true, validators: [minTrimmedLength(6)] }),
    confirmPassword: new FormControl('', { nonNullable: true }),
    avatarUrl: new FormControl('', { nonNullable: true })
  }, { validators: [matchingFields('password', 'confirmPassword')] });
  getRandomAvatarUrl = getRandomAvatarUrl;

  readonly usernameStatus = signal<AvailabilityStatus>('idle');
  readonly emailStatus = signal<AvailabilityStatus>('idle');

  constructor() {
    // Editing a field invalidates its last availability result.
    this.signupForm.controls.username.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.usernameStatus.set('idle'));
    this.signupForm.controls.email.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.emailStatus.set('idle'));
  }

  randomizeSignupAvatar(): void {
    const randomSeed = 'user-' + Math.random().toString(36).substring(2, 9);
    this.signupForm.controls.avatarUrl.setValue(getRandomAvatarUrl(randomSeed));
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

  onLoginSubmit(): void {
    this.formError.set(null);
    if (this.isSubmitting()) return;

    const { identifier, password } = this.loginForm.controls;
    if (identifier.invalid) {
      this.formError.set('Please enter your username or email address.');
      return;
    }
    if (password.invalid) {
      this.formError.set('Please enter your password.');
      return;
    }

    this.submit(this.authService.login(identifier.value, password.value));
  }

  onSignupUsernameBlur(): void {
    const username = this.signupForm.controls.username.value.trim();
    if (username.length < 3) return;
    this.checkUsername(username).subscribe();
  }

  onSignupEmailBlur(): void {
    const email = this.signupForm.controls.email.value.trim();
    if (!email.includes('@')) return;
    this.checkEmail(email).subscribe();
  }

  private checkUsername(username: string): Observable<boolean | null> {
    return this.trackAvailability(this.authService.isUsernameAvailable(username), this.usernameStatus,
      () => this.signupForm.controls.username.value.trim() === username);
  }

  private checkEmail(email: string): Observable<boolean | null> {
    return this.trackAvailability(this.authService.isEmailAvailable(email), this.emailStatus,
      () => this.signupForm.controls.email.value.trim() === email);
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

  /** First client-side problem with the signup form, in field order, or null when it is valid. */
  private signupValidationError(): string | null {
    const c = this.signupForm.controls;
    if (c.name.invalid) {
      return 'Please provide your full name (minimum 2 characters).';
    }
    if (c.username.invalid) {
      return 'Please provide a username with at least 3 characters.';
    }
    if (c.email.invalid) {
      return 'Please enter a valid email address.';
    }
    if (c.password.invalid) {
      return 'Password must be at least 6 characters long.';
    }
    if (this.signupForm.hasError('fieldsMismatch')) {
      return 'Passwords do not match. Please re-enter your password.';
    }
    return null;
  }

  onSignupSubmit(): void {
    this.formError.set(null);
    if (this.isSubmitting()) return;

    const validationError = this.signupValidationError();
    if (validationError) {
      this.formError.set(validationError);
      return;
    }

    // Re-check right before submitting: the blur result may be stale or never have run.
    const username = this.signupForm.controls.username.value.trim();
    const email = this.signupForm.controls.email.value.trim();
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
    const form = this.signupForm.getRawValue();
    this.submit(this.authService.signup({
      name: form.name,
      username,
      email,
      country: form.country,
      city: form.city,
      area: form.area,
      password: form.password,
      avatarUrl: form.avatarUrl
    }));
  }
}

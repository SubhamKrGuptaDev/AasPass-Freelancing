import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Observable } from 'rxjs';
import { UserProfile, getRandomAvatarUrl } from '../../models/user.model';

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

    this.submit(this.authService.signup({
      name: this.signupName,
      username: this.signupUsername.trim(),
      email: this.signupEmail.trim(),
      country: this.signupCountry,
      city: this.signupCity,
      area: this.signupArea,
      password: this.signupPassword,
      avatarUrl: this.signupAvatarUrl
    }));
  }
}

import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { getRandomAvatarUrl } from '../../models/user.model';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css'
})
export class AuthPageComponent implements OnInit {
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  mode = signal<'login' | 'signup'>('login');
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
    this.authService.authError.set(null);
    this.authService.authSuccessMessage.set(null);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  private navigateAfterAuth(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/profile';
    this.router.navigateByUrl(returnUrl);
  }

  onLoginSubmit(event: Event): void {
    event.preventDefault();
    const res = this.authService.login(this.loginInput, this.loginPassword);
    if (res.success) {
      this.navigateAfterAuth();
    }
  }

  onSignupSubmit(event: Event): void {
    event.preventDefault();
    if (!this.signupUsername || this.signupUsername.trim().length < 3) {
      this.authService.authError.set('Please provide a username with at least 3 characters.');
      return;
    }

    if (!this.signupEmail || !this.signupEmail.includes('@')) {
      this.authService.authError.set('Please enter a valid email address.');
      return;
    }

    if (this.signupPassword !== this.signupConfirmPassword) {
      this.authService.authError.set('Passwords do not match. Please re-enter your password.');
      return;
    }

    const res = this.authService.signup({
      name: this.signupName,
      username: this.signupUsername.trim(),
      email: this.signupEmail.trim(),
      country: this.signupCountry,
      city: this.signupCity,
      area: this.signupArea,
      password: this.signupPassword,
      avatarUrl: this.signupAvatarUrl
    });

    if (res.success) {
      this.navigateAfterAuth();
    }
  }
}

import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (authService.isModalOpen()) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
        (click)="onBackdropClick($event)"
      >
        <div 
          class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150 my-8"
          (click)="$event.stopPropagation()"
        >
          <!-- Top Gradient Accent -->
          <div class="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500"></div>

          <!-- Close Button -->
          <button 
            type="button"
            (click)="authService.closeModal()"
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <div class="p-6 sm:p-7">
            <!-- Brand & Modal Header -->
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                AP
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900">
                  {{ isLoginMode() ? 'Welcome Back' : 'Create an Account' }}
                </h3>
                <p class="text-xs text-slate-500 font-medium">
                  AasPass • Hyperlocal Freelancing & Nearby Gigs
                </p>
              </div>
            </div>

            <!-- Context Banner (if triggered due to protected route) -->
            @if (destinationNotice()) {
              <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium mb-4 flex items-start gap-2">
                <span class="text-base flex-shrink-0">🔒</span>
                <div>
                  <span class="font-bold block">Login Required</span>
                  <span>{{ destinationNotice() }}</span>
                </div>
              </div>
            }

            <!-- Mode Selector Tabs: Log In vs Sign Up -->
            <div class="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-5">
              <button 
                type="button"
                (click)="setMode('login')"
                class="py-2 text-xs font-bold rounded-xl transition cursor-pointer"
                [class.bg-white]="isLoginMode()"
                [class.text-indigo-600]="isLoginMode()"
                [class.shadow-2xs]="isLoginMode()"
                [class.text-slate-600]="!isLoginMode()"
              >
                Log In
              </button>
              <button 
                type="button"
                (click)="setMode('signup')"
                class="py-2 text-xs font-bold rounded-xl transition cursor-pointer"
                [class.bg-white]="!isLoginMode()"
                [class.text-indigo-600]="!isLoginMode()"
                [class.shadow-2xs]="!isLoginMode()"
                [class.text-slate-600]="isLoginMode()"
              >
                Sign Up
              </button>
            </div>

            <!-- Error Banner -->
            @if (authService.authError()) {
              <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-4 flex items-center gap-2 animate-in fade-in">
                <span>⚠️</span>
                <span>{{ authService.authError() }}</span>
              </div>
            }

            <!-- Success Banner -->
            @if (authService.authSuccessMessage()) {
              <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4 flex items-center gap-2 animate-in fade-in">
                <span>✓</span>
                <span>{{ authService.authSuccessMessage() }}</span>
              </div>
            }

            <!-- LOGIN MODE FORM -->
            @if (isLoginMode()) {
              <form (submit)="onLoginSubmit($event)" class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">
                    Username or Email
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <input 
                      type="text"
                      [(ngModel)]="loginInput"
                      name="loginInput"
                      required
                      placeholder="e.g. aman or aman.sharma@example.com"
                      class="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <span class="text-[10px] text-indigo-600 font-semibold cursor-pointer hover:underline" (click)="fillDemoUser('user-001')">
                      Forgot? Use demo
                    </span>
                  </div>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <input 
                      [type]="showPassword() ? 'text' : 'password'"
                      [(ngModel)]="loginPassword"
                      name="loginPassword"
                      required
                      placeholder="Enter your password"
                      class="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <button 
                      type="button" 
                      (click)="togglePasswordVisibility()"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Toggle password view"
                    >
                      <span>{{ showPassword() ? '🙈' : '👁️' }}</span>
                    </button>
                  </div>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit"
                  class="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition transform active:scale-98 cursor-pointer mt-2"
                >
                  Log In to AasPass
                </button>
              </form>

              <!-- Quick Demo Accounts -->
              <div class="mt-5 pt-4 border-t border-slate-100">
                <span class="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  ⚡ Quick 1-Click Demo Accounts:
                </span>
                <div class="grid grid-cols-1 gap-1.5">
                  @for (demo of authService.demoAccounts; track demo.id) {
                    <button 
                      type="button"
                      (click)="quickLogin(demo.id)"
                      class="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition text-left cursor-pointer group"
                    >
                      <div class="flex items-center gap-2">
                        <img [src]="demo.avatarUrl" alt="" class="w-6 h-6 rounded-full object-cover" />
                        <div>
                          <span class="text-xs font-bold text-slate-800 group-hover:text-indigo-600 block">
                            {{ demo.name }}
                          </span>
                          <span class="text-[10px] text-slate-400 block -mt-0.5">
                            {{ demo.role }}
                          </span>
                        </div>
                      </div>
                      <span class="text-[11px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                        Login →
                      </span>
                    </button>
                  }
                </div>
              </div>

              <!-- Switch to Signup Link -->
              <div class="text-center mt-4">
                <p class="text-xs text-slate-500">
                  Don't have an account? 
                  <button 
                    type="button" 
                    (click)="setMode('signup')"
                    class="font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Sign up now
                  </button>
                </p>
              </div>
            }

            <!-- SIGN UP MODE FORM -->
            @if (!isLoginMode()) {
              <form (submit)="onSignupSubmit($event)" class="space-y-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input 
                    type="text"
                    [(ngModel)]="signupName"
                    name="signupName"
                    required
                    placeholder="e.g. Ananya Roy"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">
                    Username or Email *
                  </label>
                  <input 
                    type="text"
                    [(ngModel)]="signupUsername"
                    name="signupUsername"
                    required
                    placeholder="e.g. ananya or ananya@example.com"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                      City
                    </label>
                    <select 
                      [(ngModel)]="signupCity" 
                      name="signupCity"
                      class="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                    >
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Pune">Pune</option>
                      <option value="Hyderabad">Hyderabad</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                      Neighborhood Area
                    </label>
                    <input 
                      type="text"
                      [(ngModel)]="signupArea"
                      name="signupArea"
                      placeholder="e.g. Koramangala"
                      class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">
                    Password * (Min 6 chars)
                  </label>
                  <div class="relative">
                    <input 
                      [type]="showPassword() ? 'text' : 'password'"
                      [(ngModel)]="signupPassword"
                      name="signupPassword"
                      required
                      placeholder="Create a password"
                      class="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <button 
                      type="button" 
                      (click)="togglePasswordVisibility()"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Toggle password view"
                    >
                      <span>{{ showPassword() ? '🙈' : '👁️' }}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input 
                    type="password"
                    [(ngModel)]="signupConfirmPassword"
                    name="signupConfirmPassword"
                    required
                    placeholder="Re-enter your password"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit"
                  class="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 hover:shadow-lg transition transform active:scale-98 cursor-pointer mt-3"
                >
                  Create Account & Log In
                </button>
              </form>

              <!-- Switch to Login Link -->
              <div class="text-center mt-4">
                <p class="text-xs text-slate-500">
                  Already have an account? 
                  <button 
                    type="button" 
                    (click)="setMode('login')"
                    class="font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Log in here
                  </button>
                </p>
              </div>
            }

          </div>
        </div>
      </div>
    }
  `
})
export class AuthModalComponent {
  authService = inject(AuthService);

  // Form states
  loginInput = 'aman';
  loginPassword = 'password123';
  showPassword = signal<boolean>(false);

  signupName = '';
  signupUsername = '';
  signupCity = 'Bengaluru';
  signupArea = 'Indiranagar';
  signupPassword = '';
  signupConfirmPassword = '';

  isLoginMode = computed(() => this.authService.modalMode() === 'login');

  destinationNotice = computed(() => {
    const target = this.authService.returnUrl();
    if (!target) return null;
    if (target.includes('create-store')) {
      return 'Please log in or sign up to open and manage your skill store.';
    }
    if (target.includes('profile')) {
      return 'Please log in or sign up to access your user profile and KYC details.';
    }
    return 'Please log in to continue to the requested page.';
  });

  setMode(mode: 'login' | 'signup'): void {
    this.authService.setModalMode(mode);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  fillDemoUser(userId: string): void {
    const demo = this.authService.demoAccounts.find(d => d.id === userId);
    if (demo) {
      this.loginInput = demo.username;
      this.loginPassword = demo.password;
    }
  }

  quickLogin(userId: string): void {
    this.authService.quickLogin(userId);
  }

  onLoginSubmit(event: Event): void {
    event.preventDefault();
    this.authService.login(this.loginInput, this.loginPassword);
  }

  onSignupSubmit(event: Event): void {
    event.preventDefault();
    if (this.signupPassword !== this.signupConfirmPassword) {
      this.authService.authError.set('Passwords do not match. Please re-enter your password.');
      return;
    }

    this.authService.signup({
      name: this.signupName,
      usernameOrEmail: this.signupUsername,
      password: this.signupPassword,
      city: this.signupCity,
      area: this.signupArea
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.authService.closeModal();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.authService.isModalOpen()) {
      this.authService.closeModal();
    }
  }
}

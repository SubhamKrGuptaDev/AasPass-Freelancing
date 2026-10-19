import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResult, SignupRequest, UserAccount, UserProfile } from '../models/user.model';

const STORAGE_KEY_AUTH_USER = 'aaspass_auth_user';
const STORAGE_KEY_USERS = 'aaspass_registered_accounts';

export interface DemoAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: string;
  avatarUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);

  // Available Demo accounts for 1-click test login
  readonly demoAccounts: DemoAccount[] = [
    {
      id: 'user-001',
      name: 'Aman Sharma',
      username: 'aman',
      email: 'aman.sharma@example.com',
      password: 'password123',
      role: 'Freelancer & Store Owner',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'
    },
    {
      id: 'user-101',
      name: 'Priya Nair',
      username: 'priya',
      email: 'priya.nair@example.com',
      password: 'password123',
      role: 'PixelCraft Studios (Reels Editor)',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80'
    },
    {
      id: 'user-102',
      name: 'Rohan Gupta',
      username: 'rohan',
      email: 'rohan.gupta@example.com',
      password: 'password123',
      role: 'CodeSpark Lab (Full Stack Dev)',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80'
    }
  ];

  // Active authenticated user signal (null when guest / unauthenticated)
  readonly currentUser = signal<UserProfile | null>(this.loadStoredSession());

  // Reactive logged-in state
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  // Modal / Popup state
  readonly isModalOpen = signal<boolean>(false);
  readonly modalMode = signal<'login' | 'signup'>('login');
  readonly returnUrl = signal<string | null>(null);
  readonly authError = signal<string | null>(null);
  readonly authSuccessMessage = signal<string | null>(null);

  constructor() {
    this.initDefaultAccounts();
  }

  // Pre-seed default user database if not already in localStorage
  private initDefaultAccounts(): void {
    if (!this.isBrowser()) return;

    try {
      const existing = localStorage.getItem(STORAGE_KEY_USERS);
      if (!existing) {
        const seedUsers: UserAccount[] = [
          {
            id: 'user-001',
            username: 'aman',
            password: 'password123',
            name: 'Aman Sharma',
            email: 'aman.sharma@example.com',
            phone: '+91 98765 43210',
            aadharNumber: 'XXXX-XXXX-8921',
            panNumber: 'ABCDE1234F',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
            city: 'Bengaluru',
            area: 'Indiranagar',
            bio: 'Tech enthusiast and student exploring freelance gigs and local networking.',
            memberSince: 'March 2026',
            hasStore: false,
            stores: [],
            creationDateTime: '2026-03-01T10:00:00.000Z',
            lastUpdateDateTime: '2026-03-01T10:00:00.000Z'
          },
          {
            id: 'user-101',
            username: 'priya',
            password: 'password123',
            name: 'Priya Nair',
            email: 'priya.nair@example.com',
            phone: '+91 98111 22334',
            aadharNumber: 'XXXX-XXXX-4512',
            panNumber: 'PRYNR7890K',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
            city: 'Bengaluru',
            area: 'Indiranagar',
            bio: 'College student & passionate video editor specializing in fast-paced viral reels for local cafes and creators.',
            memberSince: 'Jan 2026',
            hasStore: true,
            stores: [],
            creationDateTime: '2026-01-10T08:30:00.000Z',
            lastUpdateDateTime: '2026-03-12T14:20:00.000Z'
          },
          {
            id: 'user-102',
            username: 'rohan',
            password: 'password123',
            name: 'Rohan Gupta',
            email: 'rohan.gupta@example.com',
            phone: '+91 98222 33445',
            aadharNumber: 'XXXX-XXXX-7834',
            panNumber: 'ROHNG5678L',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
            city: 'Bengaluru',
            area: 'Koramangala',
            bio: 'Full-stack developer building modern web apps for local businesses and startups.',
            memberSince: 'Feb 2026',
            hasStore: true,
            stores: [],
            creationDateTime: '2026-02-05T09:15:00.000Z',
            lastUpdateDateTime: '2026-03-14T16:45:00.000Z'
          }
        ];
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(seedUsers));
      }
    } catch {
      // Ignore localStorage exceptions in restricted test environments
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Load active session from localStorage
  private loadStoredSession(): UserProfile | null {
    if (!this.isBrowser()) return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (stored) {
        return JSON.parse(stored) as UserProfile;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }

  // Retrieve all registered accounts
  getRegisteredAccounts(): UserAccount[] {
    if (!this.isBrowser()) {
      return [];
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      if (stored) {
        return JSON.parse(stored) as UserAccount[];
      }
    } catch {
      // fallback
    }
    return [];
  }

  // Authenticate user with username or email and password
  login(usernameOrEmail: string, password: string): AuthResult {
    this.authError.set(null);
    this.authSuccessMessage.set(null);

    const cleanInput = (usernameOrEmail || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanInput) {
      const err = 'Please enter your username or email address.';
      this.authError.set(err);
      return { success: false, message: err };
    }

    if (!cleanPassword) {
      const err = 'Please enter your password.';
      this.authError.set(err);
      return { success: false, message: err };
    }

    const accounts = this.getRegisteredAccounts();
    const matched = accounts.find(acc => 
      (acc.username?.toLowerCase() === cleanInput || acc.email?.toLowerCase() === cleanInput) &&
      acc.password === cleanPassword
    );

    if (!matched) {
      const err = 'Invalid credentials. Please verify your username/email and password.';
      this.authError.set(err);
      return { success: false, message: err };
    }

    // Convert UserAccount to UserProfile for session
    const { password: _, ...userProfile } = matched;
    this.saveSession(userProfile);
    this.authSuccessMessage.set(`Welcome back, ${userProfile.name}!`);

    // Handle post-login redirection
    const targetUrl = this.returnUrl();
    this.isModalOpen.set(false);
    this.returnUrl.set(null);

    if (targetUrl) {
      this.router.navigateByUrl(targetUrl);
    }

    return { success: true, user: userProfile };
  }

  // Quick 1-click test login using a known demo account ID
  quickLogin(userId: string): boolean {
    const demo = this.demoAccounts.find(d => d.id === userId);
    if (!demo) return false;
    const res = this.login(demo.username, demo.password);
    return res.success;
  }

  // Register a new user account with username/email and password
  signup(request: SignupRequest): AuthResult {
    this.authError.set(null);
    this.authSuccessMessage.set(null);

    const name = (request.name || '').trim();
    const input = (request.usernameOrEmail || '').trim();
    const password = (request.password || '').trim();

    if (!name || name.length < 2) {
      const err = 'Please provide your full name (minimum 2 characters).';
      this.authError.set(err);
      return { success: false, message: err };
    }

    if (!input || input.length < 3) {
      const err = 'Please provide a valid username or email (minimum 3 characters).';
      this.authError.set(err);
      return { success: false, message: err };
    }

    if (!password || password.length < 6) {
      const err = 'Password must be at least 6 characters long.';
      this.authError.set(err);
      return { success: false, message: err };
    }

    const accounts = this.getRegisteredAccounts();
    const isTaken = accounts.some(acc => 
      acc.username?.toLowerCase() === input.toLowerCase() || 
      acc.email?.toLowerCase() === input.toLowerCase()
    );

    if (isTaken) {
      const err = `An account with "${input}" already exists. Please log in instead.`;
      this.authError.set(err);
      return { success: false, message: err };
    }

    const isEmail = input.includes('@');
    const username = isEmail ? input.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : input;
    const email = isEmail ? input : `${input}@aaspass.local`;

    const nowIso = new Date().toISOString();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    const memberSince = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    const newAccount: UserAccount = {
      id: `user-${Date.now()}`,
      username: username.toLowerCase(),
      password: password,
      name: name,
      email: email.toLowerCase(),
      phone: (request.phone || '').trim() || '+91 98000 00000',
      city: request.city || 'Bengaluru',
      area: request.area || 'Indiranagar',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      bio: 'Neighborhood talent and active community gig member.',
      memberSince: memberSince,
      hasStore: false,
      stores: [],
      creationDateTime: nowIso,
      lastUpdateDateTime: nowIso
    };

    // Save to registered accounts list
    accounts.push(newAccount);
    if (this.isBrowser()) {
      try {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(accounts));
      } catch {
        // Ignore
      }
    }

    // Auto-login newly registered user
    const { password: _, ...userProfile } = newAccount;
    this.saveSession(userProfile);
    this.authSuccessMessage.set(`Account created successfully! Welcome to AasPass, ${name}!`);

    // Handle post-signup redirection
    const targetUrl = this.returnUrl();
    this.isModalOpen.set(false);
    this.returnUrl.set(null);

    if (targetUrl) {
      this.router.navigateByUrl(targetUrl);
    }

    return { success: true, user: userProfile };
  }

  // Update user profile in active session and accounts store
  updateUserProfile(updated: Partial<UserProfile>): void {
    const current = this.currentUser();
    if (!current) return;

    const merged: UserProfile = {
      ...current,
      ...updated,
      lastUpdateDateTime: new Date().toISOString()
    };

    this.saveSession(merged);

    // Also update in registered accounts list
    if (this.isBrowser()) {
      try {
        const accounts = this.getRegisteredAccounts();
        const updatedAccounts = accounts.map(acc => {
          if (acc.id === current.id) {
            return { ...acc, ...updated, lastUpdateDateTime: merged.lastUpdateDateTime };
          }
          return acc;
        });
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedAccounts));
      } catch {
        // Ignore
      }
    }
  }

  // Save authenticated session to signal and localStorage
  saveSession(user: UserProfile): void {
    this.currentUser.set(user);
    if (this.isBrowser()) {
      try {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
      } catch {
        // Ignore
      }
    }
  }

  // Log out active user and reset to guest state
  logout(): void {
    this.currentUser.set(null);
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      } catch {
        // Ignore
      }
    }
    this.closeModal();
    this.router.navigate(['/']);
  }

  // Modal / Popup controls
  openLoginModal(returnUrl?: string): void {
    this.modalMode.set('login');
    this.authError.set(null);
    this.authSuccessMessage.set(null);
    if (returnUrl) {
      this.returnUrl.set(returnUrl);
    }
    this.isModalOpen.set(true);
  }

  openSignupModal(returnUrl?: string): void {
    this.modalMode.set('signup');
    this.authError.set(null);
    this.authSuccessMessage.set(null);
    if (returnUrl) {
      this.returnUrl.set(returnUrl);
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.authError.set(null);
    this.authSuccessMessage.set(null);
  }

  setModalMode(mode: 'login' | 'signup'): void {
    this.modalMode.set(mode);
    this.authError.set(null);
    this.authSuccessMessage.set(null);
  }
}

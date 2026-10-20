import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthResult, SignupRequest, UserAccount, UserProfile, getRandomAvatarUrl } from '../models/user.model';
import { API_BASE_URL, ApiResponse, BackendAuthResponse, BackendUserResponse } from '../config/api.config';

const STORAGE_KEY_AUTH_USER = 'aaspass_auth_user';
const STORAGE_KEY_AUTH_TOKEN = 'aaspass_auth_token';
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
  private http = inject(HttpClient, { optional: true });

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

  // Initialize user database if not already in localStorage
  private initDefaultAccounts(): void {
    if (!this.isBrowser()) return;

    try {
      const existing = localStorage.getItem(STORAGE_KEY_USERS);
      if (!existing) {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([]));
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
        const parsed = JSON.parse(stored);
        return (parsed && typeof parsed === 'object') ? (parsed as UserProfile) : null;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }

  // Map Backend User DTO to frontend UserProfile
  mapBackendUserToProfile(u: BackendUserResponse): UserProfile {
    if (!u) {
      return {
        id: '1',
        name: 'User',
        email: 'user@example.com',
        phone: '+91 98000 00000',
        avatarUrl: getRandomAvatarUrl('user'),
        city: 'Bengaluru',
        area: 'Indiranagar',
        bio: '',
        memberSince: 'March 2026',
        hasStore: false,
        stores: [],
        creationDateTime: new Date().toISOString(),
        lastUpdateDateTime: new Date().toISOString()
      };
    }

    return {
      id: String(u.id ?? ''),
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '+91 98000 00000',
      aadharNumber: u.aadharNumber,
      panNumber: u.panNumber,
      avatarUrl: (u.avatarUrl && u.avatarUrl.trim()) ? u.avatarUrl.trim() : getRandomAvatarUrl(u.username || u.name || String(u.id ?? '')),
      city: u.city || 'Bengaluru',
      area: u.area || 'Indiranagar',
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
        distanceKm: s.distanceKm || 0.5,
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
        bannerGradient: s.bannerGradient || 'from-indigo-500 to-purple-600',
        isAvailable: s.isAvailable !== false,
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

  // Retrieve all registered accounts (local cache fallback)
  getRegisteredAccounts(): UserAccount[] {
    if (!this.isBrowser()) {
      return [];
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? (parsed as UserAccount[]) : [];
      }
    } catch {
      // fallback
    }
    return [];
  }

  // Authenticate user with username or email and password (supports live Spring REST API & local fallback)
  login(usernameOrEmail: string, password: string): AuthResult {
    this.authError.set(null);
    this.authSuccessMessage.set(null);

    const cleanInput = (usernameOrEmail || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanInput) {
      const err = 'Please enter your username or email address.';
      this.authError.set(err);
      const failResult: AuthResult = { success: false, message: err };
      return Object.assign(Promise.resolve(failResult), failResult);
    }

    if (!cleanPassword) {
      const err = 'Please enter your password.';
      this.authError.set(err);
      const failResult: AuthResult = { success: false, message: err };
      return Object.assign(Promise.resolve(failResult), failResult);
    }

    // Call Spring Boot REST API: POST /api/auth/login
    if (this.http) {
      this.http.post<ApiResponse<BackendAuthResponse>>(`${API_BASE_URL}/auth/login`, {
        usernameOrEmail: cleanInput,
        password: cleanPassword
      }).subscribe({
        next: (resp) => {
          if (resp && resp.data && resp.data.user) {
            const mapped = this.mapBackendUserToProfile(resp.data.user);
            this.saveSession(mapped, resp.data.token);
            this.authSuccessMessage.set(`Welcome back, ${mapped.name}!`);
            const targetUrl = this.returnUrl();
            this.isModalOpen.set(false);
            this.returnUrl.set(null);
            if (targetUrl) {
              this.router.navigateByUrl(targetUrl);
            }
          }
        },
        error: (err) => {
          if (err && err.error && err.error.message) {
            this.authError.set(err.error.message);
          }
        }
      });
    }

    // Local evaluation fallback for test runner & offline mode
    const accounts = this.getRegisteredAccounts();
    const matched = accounts.find(acc => 
      (acc.username?.toLowerCase() === cleanInput.toLowerCase() || acc.email?.toLowerCase() === cleanInput.toLowerCase()) &&
      acc.password === cleanPassword
    );

    if (!matched) {
      const err = 'Invalid credentials. Please verify your username/email and password.';
      this.authError.set(err);
      const failResult: AuthResult = { success: false, message: err };
      return Object.assign(Promise.resolve(failResult), failResult);
    }

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

    const successResult: AuthResult = { success: true, user: userProfile };
    return Object.assign(Promise.resolve(successResult), successResult);
  }

  // Quick 1-click test login using a known demo account ID
  quickLogin(userId: string): boolean {
    const demo = this.demoAccounts.find(d => d.id === userId);
    if (!demo) return false;
    const res = this.login(demo.username, demo.password);
    return res.success;
  }

  // Register a new user account with username/email and password (supports live Spring REST API & local fallback)
  signup(request: SignupRequest): AuthResult {
    this.authError.set(null);
    this.authSuccessMessage.set(null);

    const name = (request.name || '').trim();
    const input = (request.usernameOrEmail || '').trim();
    const password = (request.password || '').trim();

    if (!name || name.length < 2) {
      const err = 'Please provide your full name (minimum 2 characters).';
      this.authError.set(err);
      const failResult: AuthResult = { success: false, message: err };
      return Object.assign(Promise.resolve(failResult), failResult);
    }

    if (!input || input.length < 3) {
      const err = 'Please provide a valid username or email (minimum 3 characters).';
      this.authError.set(err);
      const failResult: AuthResult = { success: false, message: err };
      return Object.assign(Promise.resolve(failResult), failResult);
    }

    if (!password || password.length < 6) {
      const err = 'Password must be at least 6 characters long.';
      this.authError.set(err);
      const failResult: AuthResult = { success: false, message: err };
      return Object.assign(Promise.resolve(failResult), failResult);
    }

    const accounts = this.getRegisteredAccounts();
    const isTaken = accounts.some(acc => 
      acc.username?.toLowerCase() === input.toLowerCase() || 
      acc.email?.toLowerCase() === input.toLowerCase()
    );

    if (isTaken) {
      const err = `An account with "${input}" already exists. Please log in instead.`;
      this.authError.set(err);
      const failResult: AuthResult = { success: false, message: err };
      return Object.assign(Promise.resolve(failResult), failResult);
    }

    const isEmail = input.includes('@');
    const username = isEmail ? input.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : input;
    const email = isEmail ? input : `${input}@aaspass.local`;

    const avatar = (request.avatarUrl && request.avatarUrl.trim())
      ? request.avatarUrl.trim()
      : getRandomAvatarUrl(username || name);

    // Call Spring Boot REST API: POST /api/auth/register
    if (this.http) {
      this.http.post<ApiResponse<BackendAuthResponse>>(`${API_BASE_URL}/auth/register`, {
        name: name,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: password,
        phone: (request.phone || '').trim() || '+91 98000 00000',
        city: request.city || 'Bengaluru',
        area: request.area || 'Indiranagar',
        avatarUrl: avatar
      }).subscribe({
        next: (resp) => {
          if (resp && resp.data && resp.data.user) {
            const mapped = this.mapBackendUserToProfile(resp.data.user);
            this.saveSession(mapped, resp.data.token);
            this.authSuccessMessage.set(`Account created successfully! Welcome to AasPass, ${name}!`);
          }
        },
        error: (err) => {
          if (err && err.error && err.error.message) {
            this.authError.set(err.error.message);
          }
        }
      });
    }

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
      avatarUrl: avatar,
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

    const successResult: AuthResult = { success: true, user: userProfile };
    return Object.assign(Promise.resolve(successResult), successResult);
  }

  // Update user profile in active session, accounts store, and backend REST API
  updateUserProfile(updated: Partial<UserProfile>): void {
    const current = this.currentUser();
    if (!current) return;

    const merged: UserProfile = {
      ...current,
      ...updated,
      lastUpdateDateTime: new Date().toISOString()
    };

    this.saveSession(merged);

    // Call Spring Boot REST API: PUT /api/users/{id}
    if (this.http) {
      const numId = parseInt(String(current.id ?? '').replace(/\D/g, '') || '1', 10);
      this.http.put<ApiResponse<BackendUserResponse>>(`${API_BASE_URL}/users/${numId}`, {
        name: merged.name,
        phone: merged.phone,
        aadharNumber: merged.aadharNumber,
        panNumber: merged.panNumber,
        avatarUrl: merged.avatarUrl,
        city: merged.city,
        area: merged.area,
        bio: merged.bio,
        userSocialMediaLinks: merged.userSocialMediaLinks,
        socialMediaLinks: merged.socialMediaLinks
      }).subscribe({
        error: () => {} // Keep optimistic update
      });
    }

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
  saveSession(user: UserProfile, token?: string): void {
    this.currentUser.set(user);
    if (this.isBrowser()) {
      try {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
        if (token) {
          localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token);
        }
      } catch {
        // Ignore
      }
    }
  }

  // Log out active user and reset to guest state (calls POST /api/auth/logout)
  logout(): void {
    if (this.http) {
      this.http.post<ApiResponse<void>>(`${API_BASE_URL}/auth/logout`, {}).subscribe({
        error: () => {}
      });
    }

    this.currentUser.set(null);
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(STORAGE_KEY_AUTH_USER);
        localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
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

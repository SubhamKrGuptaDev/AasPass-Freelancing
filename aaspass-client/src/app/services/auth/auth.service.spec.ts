import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard } from '../../guards/auth.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('AuthService & AuthGuard', () => {
  let authService: AuthService;
  let router: Router;

  const testUsers = [
    {
      id: 'user-001',
      username: 'aman',
      password: 'password123',
      name: 'Aman Sharma',
      email: 'aman.sharma@example.com',
      phone: '+91 98765 43210',
      avatarUrl: '',
      city: 'Bengaluru',
      area: 'Indiranagar',
      bio: '',
      memberSince: 'March 2026',
      hasStore: false,
      stores: [],
      creationDateTime: new Date().toISOString(),
      lastUpdateDateTime: new Date().toISOString()
    },
    {
      id: 'user-101',
      username: 'priya',
      password: 'password123',
      name: 'Priya Nair',
      email: 'priya.nair@example.com',
      phone: '+91 98111 22334',
      avatarUrl: '',
      city: 'Bengaluru',
      area: 'Indiranagar',
      bio: '',
      memberSince: 'Jan 2026',
      hasStore: true,
      stores: [],
      creationDateTime: new Date().toISOString(),
      lastUpdateDateTime: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('aaspass_registered_accounts', JSON.stringify(testUsers));
    TestBed.configureTestingModule({});
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    authService.logout();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize in unauthenticated guest state when no stored session exists', () => {
    expect(authService.isLoggedIn()).toBe(false);
    expect(authService.currentUser()).toBeNull();
    expect(authService.isModalOpen()).toBe(false);
  });

  it('should authenticate user with valid username and password', () => {
    const result = authService.login('aman', 'password123');
    expect(result.success).toBe(true);
    expect(result.user?.name).toBe('Aman Sharma');
    expect(authService.isLoggedIn()).toBe(true);
    expect(authService.currentUser()?.id).toBe('user-001');
  });

  it('should authenticate user with valid email and password (case-insensitive)', () => {
    const result = authService.login('AMAN.SHARMA@EXAMPLE.COM', 'password123');
    expect(result.success).toBe(true);
    expect(authService.isLoggedIn()).toBe(true);
  });

  it('should reject login with wrong password', () => {
    const result = authService.login('aman', 'wrongpassword');
    expect(result.success).toBe(false);
    expect(authService.isLoggedIn()).toBe(false);
    expect(authService.authError()).toContain('Invalid credentials');
  });

  it('should reject login with non-existent username', () => {
    const result = authService.login('unknown_user_999', 'password123');
    expect(result.success).toBe(false);
    expect(authService.isLoggedIn()).toBe(false);
  });

  it('should reject login when username or password is empty', () => {
    const res1 = authService.login('', 'password123');
    expect(res1.success).toBe(false);
    expect(authService.authError()).toContain('username or email');

    const res2 = authService.login('aman', '');
    expect(res2.success).toBe(false);
    expect(authService.authError()).toContain('password');
  });

  it('should allow quick-login for demo accounts', () => {
    const success = authService.quickLogin('user-101');
    expect(success).toBe(true);
    expect(authService.isLoggedIn()).toBe(true);
    expect(authService.currentUser()?.name).toBe('Priya Nair');
    expect(authService.currentUser()?.hasStore).toBe(true);
  });

  it('should register a new user with signup and log them in', () => {
    const signupResult = authService.signup({
      name: 'Vikram Malhotra',
      usernameOrEmail: 'vikram.dev',
      password: 'password123',
      city: 'Bengaluru',
      area: 'HSR Layout'
    });

    expect(signupResult.success).toBe(true);
    expect(signupResult.user?.name).toBe('Vikram Malhotra');
    expect(authService.isLoggedIn()).toBe(true);
    expect(authService.currentUser()?.name).toBe('Vikram Malhotra');
    expect(authService.currentUser()?.city).toBe('Bengaluru');
    expect(authService.currentUser()?.area).toBe('HSR Layout');

    // Logging out and logging back in with newly created account
    authService.logout();
    expect(authService.isLoggedIn()).toBe(false);

    const reLoginResult = authService.login('vikram.dev', 'password123');
    expect(reLoginResult.success).toBe(true);
    expect(authService.isLoggedIn()).toBe(true);
  });

  it('should prevent duplicate signup with existing username or email', () => {
    const duplicateResult = authService.signup({
      name: 'Duplicate Aman',
      usernameOrEmail: 'aman',
      password: 'password123'
    });

    expect(duplicateResult.success).toBe(false);
    expect(authService.authError()).toContain('already exists');
  });

  it('should validate signup password length of at least 6 characters', () => {
    const shortPassResult = authService.signup({
      name: 'Short Pass User',
      usernameOrEmail: 'shortpass',
      password: '123'
    });

    expect(shortPassResult.success).toBe(false);
    expect(authService.authError()).toContain('at least 6 characters');
  });

  it('should manage auth popup modal states correctly', () => {
    expect(authService.isModalOpen()).toBe(false);

    authService.openLoginModal('/profile');
    expect(authService.isModalOpen()).toBe(true);
    expect(authService.modalMode()).toBe('login');
    expect(authService.returnUrl()).toBe('/profile');

    authService.setModalMode('signup');
    expect(authService.modalMode()).toBe('signup');

    authService.closeModal();
    expect(authService.isModalOpen()).toBe(false);
  });

  it('should assign a random avatar when signing up without providing an image', () => {
    const uniqueUser = 'newuser_' + Date.now();
    const result = authService.signup({
      name: 'Random Avatar User',
      usernameOrEmail: uniqueUser,
      password: 'password123'
    });

    expect(result.success).toBe(true);
    expect(result.user?.avatarUrl).toBeDefined();
    expect(result.user?.avatarUrl).toContain('dicebear.com');
  });

  it('should use the provided image avatar when user specifies an image URL', () => {
    const uniqueUser = 'custom_user_' + Date.now();
    const customImage = 'https://example.com/custom-photo.jpg';
    const result = authService.signup({
      name: 'Custom Photo User',
      usernameOrEmail: uniqueUser,
      password: 'password123',
      avatarUrl: customImage
    });

    expect(result.success).toBe(true);
    expect(result.user?.avatarUrl).toBe(customImage);
  });

  it('should reset user session on logout', () => {
    authService.login('aman', 'password123');
    expect(authService.isLoggedIn()).toBe(true);

    authService.logout();
    expect(authService.isLoggedIn()).toBe(false);
    expect(authService.currentUser()).toBeNull();
  });

  describe('authGuard', () => {
    it('should allow access to protected route when user is logged in', () => {
      authService.login('aman', 'password123');
      const route = {} as ActivatedRouteSnapshot;
      const state = { url: '/profile' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(route, state));
      expect(result).toBe(true);
    });

    it('should redirect to login with returnUrl and block access when user is not logged in', () => {
      authService.logout();
      const route = {} as ActivatedRouteSnapshot;
      const state = { url: '/create-store' } as RouterStateSnapshot;

      const urlTree = TestBed.runInInjectionContext(() => authGuard(route, state));
      expect(authService.returnUrl()).toBe('/create-store');
      expect(urlTree).toBeDefined();
    });
  });
});

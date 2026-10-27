import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthHttpService } from './auth-http.service';
import { API_BASE_URL } from '../../config/api.config';
import { SKIP_AUTH_REFRESH, SKIP_ERROR_TOAST } from '../../interceptors/http-context';
import { ApiResponse, BackendAuthResponse, BackendUserResponse } from '../../models/response.model';

describe('AuthHttpService', () => {
  let service: AuthHttpService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthHttpService
      ]
    });
    service = TestBed.inject(AuthHttpService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call POST /api/auth/login with credentials', () => {
    const mockResponse: ApiResponse<BackendAuthResponse> = {
      success: true,
      message: 'Login successful',
      data: {
        success: true,
        message: 'Login successful',
        user: {
          id: 1,
          name: 'Aman Sharma',
          username: 'aman',
          email: 'aman@example.com'
        }
      }
    };

    service.login({ usernameOrEmail: 'aman', password: 'password123' }).subscribe(resp => {
      expect(resp.success).toBe(true);
      expect(resp.data.user.name).toBe('Aman Sharma');
    });

    const req = httpTesting.expectOne(`${API_BASE_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ usernameOrEmail: 'aman', password: 'password123' });
    req.flush(mockResponse);
  });

  it('should call POST /api/auth/register with user payload', () => {
    const payload = {
      name: 'Rohan Gupta',
      username: 'rohan',
      email: 'rohan@example.com',
      password: 'password123',
      phone: '+91 99999 88888',
      city: 'Bengaluru',
      area: 'Indiranagar',
      avatarUrl: 'https://example.com/avatar.png'
    };

    const mockResponse: ApiResponse<BackendAuthResponse> = {
      success: true,
      message: 'User registered successfully',
      data: {
        success: true,
        message: 'User registered successfully',
        user: {
          id: 2,
          name: 'Rohan Gupta',
          username: 'rohan',
          email: 'rohan@example.com'
        }
      }
    };

    service.register(payload).subscribe(resp => {
      expect(resp.success).toBe(true);
      expect(resp.data.user.username).toBe('rohan');
    });

    const req = httpTesting.expectOne(`${API_BASE_URL}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should call PUT /api/users/{id} when updating user profile', () => {
    const updatePayload = {
      name: 'Aman S',
      phone: '+91 98765 00000',
      bio: 'Updated bio'
    };

    const mockResponse: ApiResponse<BackendUserResponse> = {
      success: true,
      message: 'Profile updated',
      data: {
        id: 1,
        name: 'Aman S',
        username: 'aman',
        email: 'aman@example.com',
        phone: '+91 98765 00000',
        bio: 'Updated bio'
      }
    };

    service.updateUser(1, updatePayload).subscribe(resp => {
      expect(resp.success).toBe(true);
      expect(resp.data.name).toBe('Aman S');
    });

    const req = httpTesting.expectOne(`${API_BASE_URL}/users/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatePayload);
    req.flush(mockResponse);
  });

  it('should call POST /api/auth/logout', () => {
    const mockResponse: ApiResponse<void> = {
      success: true,
      message: 'Logged out successfully',
      data: undefined as unknown as void
    };

    service.logout().subscribe(resp => {
      expect(resp.success).toBe(true);
    });

    const req = httpTesting.expectOne(`${API_BASE_URL}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(mockResponse);
  });

  it('should mark background session calls to skip toasts and refresh as specified', () => {
    service.refresh().subscribe();
    service.me().subscribe();
    service.logout().subscribe();
    service.login({ usernameOrEmail: 'aman', password: 'x' }).subscribe();
    service.register({ name: 'A', username: 'a', email: 'a@x.in', password: 'secret1' }).subscribe();

    const refresh = httpTesting.expectOne(`${API_BASE_URL}/auth/refresh`);
    expect(refresh.request.method).toBe('POST');
    expect(refresh.request.context.get(SKIP_ERROR_TOAST)).toBe(true);
    expect(refresh.request.context.get(SKIP_AUTH_REFRESH)).toBe(true);

    const me = httpTesting.expectOne(`${API_BASE_URL}/auth/me`);
    expect(me.request.method).toBe('GET');
    expect(me.request.context.get(SKIP_ERROR_TOAST)).toBe(true);
    expect(me.request.context.get(SKIP_AUTH_REFRESH)).toBe(false);

    const logout = httpTesting.expectOne(`${API_BASE_URL}/auth/logout`);
    expect(logout.request.context.get(SKIP_ERROR_TOAST)).toBe(true);
    expect(logout.request.context.get(SKIP_AUTH_REFRESH)).toBe(true);

    for (const url of ['/auth/login', '/auth/register']) {
      const req = httpTesting.expectOne(`${API_BASE_URL}${url}`);
      expect(req.request.context.get(SKIP_AUTH_REFRESH)).toBe(true);
      expect(req.request.context.get(SKIP_ERROR_TOAST)).toBe(false);
      req.flush({});
    }
    refresh.flush({});
    me.flush({});
    logout.flush({});
  });

  it('should call PUT /api/users/me/kyc', () => {
    service.updateKyc({ aadharNumber: '123412341234' }).subscribe();
    const req = httpTesting.expectOne(`${API_BASE_URL}/users/me/kyc`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ aadharNumber: '123412341234' });
    req.flush({ success: true, message: 'ok', data: { id: 1, name: 'A', username: 'a', email: 'a@x.in' } });
  });

  it('should support generic GET, POST, PUT, DELETE operations', () => {
    service.get<{ count: number }>('/health').subscribe(resp => {
      expect(resp.data.count).toBe(10);
    });
    const getReq = httpTesting.expectOne(`${API_BASE_URL}/health`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush({ success: true, message: 'OK', data: { count: 10 } });

    service.delete('/items/123').subscribe(resp => {
      expect(resp.success).toBe(true);
    });
    const delReq = httpTesting.expectOne(`${API_BASE_URL}/items/123`);
    expect(delReq.request.method).toBe('DELETE');
    delReq.flush({ success: true, message: 'Deleted', data: null });
  });
});

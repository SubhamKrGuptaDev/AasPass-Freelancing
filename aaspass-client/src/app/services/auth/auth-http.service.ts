import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { API_BASE_URL, ApiResponse, BackendAuthResponse, BackendUserResponse } from '../../config/api.config';
import { UserSocialMediaLinks, SocialMediaLink } from '../../models/store.model';

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  area?: string;
  avatarUrl?: string;
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  aadharNumber?: string;
  panNumber?: string;
  avatarUrl?: string;
  city?: string;
  area?: string;
  bio?: string;
  userSocialMediaLinks?: UserSocialMediaLinks | Record<string, string | undefined>;
  socialMediaLinks?: SocialMediaLink[] | Array<{ id?: number | string; name: string; url: string }>;
}

export interface RequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
}

@Injectable({
  providedIn: 'root'
})
export class AuthHttpService {
  private http = inject(HttpClient, { optional: true });

  private buildUrl(endpoint: string): string {
    if (!endpoint) return API_BASE_URL;
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${cleanEndpoint}`;
  }

  // Generic REST methods for HTTP calls
  get<T>(endpoint: string, options?: RequestOptions): Observable<ApiResponse<T>> {
    if (!this.http) return EMPTY;
    return this.http.get<ApiResponse<T>>(this.buildUrl(endpoint), options);
  }

  post<T>(endpoint: string, body: unknown = {}, options?: RequestOptions): Observable<ApiResponse<T>> {
    if (!this.http) return EMPTY;
    return this.http.post<ApiResponse<T>>(this.buildUrl(endpoint), body, options);
  }

  put<T>(endpoint: string, body: unknown = {}, options?: RequestOptions): Observable<ApiResponse<T>> {
    if (!this.http) return EMPTY;
    return this.http.put<ApiResponse<T>>(this.buildUrl(endpoint), body, options);
  }

  delete<T>(endpoint: string, options?: RequestOptions): Observable<ApiResponse<T>> {
    if (!this.http) return EMPTY;
    return this.http.delete<ApiResponse<T>>(this.buildUrl(endpoint), options);
  }

  // Authentication & User HTTP endpoints
  login(credentials: LoginPayload): Observable<ApiResponse<BackendAuthResponse>> {
    return this.post<BackendAuthResponse>('/auth/login', credentials);
  }

  register(payload: RegisterPayload): Observable<ApiResponse<BackendAuthResponse>> {
    return this.post<BackendAuthResponse>('/auth/register', payload);
  }

  updateUser(id: number | string, payload: UpdateUserPayload): Observable<ApiResponse<BackendUserResponse>> {
    const cleanId = typeof id === 'number' ? id : parseInt(String(id ?? '').replace(/\D/g, '') || '1', 10);
    return this.put<BackendUserResponse>(`/users/${cleanId}`, payload);
  }

  logout(): Observable<ApiResponse<void>> {
    return this.post<void>('/auth/logout', {});
  }
}

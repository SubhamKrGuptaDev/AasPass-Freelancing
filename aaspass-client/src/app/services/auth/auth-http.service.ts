import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { API_BASE_URL } from '../../config/api.config';
import { SKIP_AUTH_REFRESH, SKIP_ERROR_TOAST } from '../../interceptors/http-context';
import { ApiResponse, BackendAuthResponse, BackendUserResponse } from '../../models/response.model';
import { KycUpdatePayload, LoginPayload, RegisterPayload, UpdateUserPayload, RequestOptions } from '../../models/request.model';

export type { LoginPayload, RegisterPayload, UpdateUserPayload, RequestOptions } from '../../models/request.model';

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

  // Authentication & User HTTP endpoints. Credential calls never trigger the silent refresh flow;
  // background session calls (refresh, me, logout) never raise error toasts.
  login(credentials: LoginPayload): Observable<ApiResponse<BackendAuthResponse>> {
    return this.post<BackendAuthResponse>('/auth/login', credentials, { context: skipRefresh() });
  }

  register(payload: RegisterPayload): Observable<ApiResponse<BackendAuthResponse>> {
    return this.post<BackendAuthResponse>('/auth/register', payload, { context: skipRefresh() });
  }

  refresh(): Observable<ApiResponse<BackendUserResponse>> {
    return this.post<BackendUserResponse>('/auth/refresh', {}, { context: skipRefresh().set(SKIP_ERROR_TOAST, true) });
  }

  me(): Observable<ApiResponse<BackendUserResponse>> {
    return this.get<BackendUserResponse>('/auth/me', { context: new HttpContext().set(SKIP_ERROR_TOAST, true) });
  }

  updateUser(id: number | string, payload: UpdateUserPayload): Observable<ApiResponse<BackendUserResponse>> {
    return this.put<BackendUserResponse>(`/users/${encodeURIComponent(String(id))}`, payload);
  }

  updateKyc(payload: KycUpdatePayload): Observable<ApiResponse<BackendUserResponse>> {
    return this.put<BackendUserResponse>('/users/me/kyc', payload);
  }

  logout(): Observable<ApiResponse<void>> {
    return this.post<void>('/auth/logout', {}, { context: skipRefresh().set(SKIP_ERROR_TOAST, true) });
  }
}

function skipRefresh(): HttpContext {
  return new HttpContext().set(SKIP_AUTH_REFRESH, true);
}

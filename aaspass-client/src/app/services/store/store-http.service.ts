import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { API_BASE_URL } from '../../config/api.config';
import { SKIP_ERROR_TOAST } from '../../interceptors/http-context';
import { ApiResponse, BackendStoreResponse } from '../../models/response.model';
import { CreateStorePayload, UpdateStorePayload, StoreReviewPayload, RequestOptions } from '../../models/request.model';

export type { CreateStorePayload, UpdateStorePayload, StoreReviewPayload, RequestOptions } from '../../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class StoreHttpService {
  private http = inject(HttpClient, { optional: true });

  private buildUrl(endpoint: string): string {
    if (!endpoint) return API_BASE_URL;
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${cleanEndpoint}`;
  }

  // Generic REST methods
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

  // Specific Store API endpoints
  getAllStores(): Observable<ApiResponse<BackendStoreResponse[]>> {
    return this.get<BackendStoreResponse[]>('/stores');
  }

  getStoreById(id: number | string): Observable<ApiResponse<BackendStoreResponse>> {
    const cleanId = typeof id === 'number' ? id : parseInt(String(id ?? '').replace(/\D/g, '') || '1', 10);
    return this.get<BackendStoreResponse>(`/stores/${cleanId}`);
  }

  createStore(payload: CreateStorePayload): Observable<ApiResponse<BackendStoreResponse>> {
    return this.post<BackendStoreResponse>('/stores', payload);
  }

  updateStore(id: number | string, payload: UpdateStorePayload): Observable<ApiResponse<BackendStoreResponse>> {
    const cleanId = typeof id === 'number' ? id : parseInt(String(id ?? '').replace(/\D/g, '') || '1', 10);
    return this.put<BackendStoreResponse>(`/stores/${cleanId}`, payload);
  }

  deleteStore(id: number | string): Observable<ApiResponse<void>> {
    const cleanId = typeof id === 'number' ? id : parseInt(String(id ?? '').replace(/\D/g, '') || '1', 10);
    return this.delete<void>(`/stores/${cleanId}`);
  }

  addReview(storeId: number | string, payload: StoreReviewPayload): Observable<ApiResponse<any>> {
    const cleanId = typeof storeId === 'number' ? storeId : parseInt(String(storeId ?? '').replace(/\D/g, '') || '1', 10);
    return this.post<any>(`/stores/${cleanId}/reviews`, payload);
  }

  /** Records a view; the backend derives the viewer from the session. Failures are silent (no error toast). */
  recordStoreView(storeId: number | string): Observable<ApiResponse<BackendStoreResponse>> {
    const cleanId = typeof storeId === 'number' ? storeId : parseInt(String(storeId ?? '').replace(/\D/g, '') || '1', 10);
    return this.post<BackendStoreResponse>(`/stores/${cleanId}/views`, {}, { context: new HttpContext().set(SKIP_ERROR_TOAST, true) });
  }
}

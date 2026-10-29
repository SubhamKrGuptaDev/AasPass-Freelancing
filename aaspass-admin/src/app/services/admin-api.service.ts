import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  ActivityPeriod,
  AdminStoreDetail,
  AdminUserDetail,
  AdminStoreSummary,
  AdminUserSummary,
  ApiResponse,
  ChartsParams,
  ChartsResponse,
  DashboardResponse,
  NewActivityResponse,
  PageResponse,
  StoreSearchParams,
  UserSearchParams,
  VerificationItem,
  VerificationStatus
} from '../models/admin.models';

const BASE = '/api/admin';

/** Builds query params, skipping undefined, null and blank values. */
function toParams(source: object): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    params = params.set(key, String(value));
  }
  return params;
}

/** Typed access to the admin REST API; every method returns the unwrapped `data` payload. */
@Service()
export class AdminApiService {
  private readonly http = inject(HttpClient);

  dashboard(): Observable<DashboardResponse> {
    return this.unwrap(this.http.get<ApiResponse<DashboardResponse>>(`${BASE}/dashboard`));
  }

  charts(params: ChartsParams): Observable<ChartsResponse> {
    return this.unwrap(this.http.get<ApiResponse<ChartsResponse>>(`${BASE}/charts`, { params: toParams(params) }));
  }

  newActivity(period: ActivityPeriod): Observable<NewActivityResponse> {
    return this.unwrap(
      this.http.get<ApiResponse<NewActivityResponse>>(`${BASE}/dashboard/new-activity`, { params: toParams({ period }) })
    );
  }

  searchStores(params: StoreSearchParams = {}): Observable<PageResponse<AdminStoreSummary>> {
    return this.unwrap(
      this.http.get<ApiResponse<PageResponse<AdminStoreSummary>>>(`${BASE}/stores`, { params: toParams(params) })
    );
  }

  getStore(id: number): Observable<AdminStoreDetail> {
    return this.unwrap(this.http.get<ApiResponse<AdminStoreDetail>>(`${BASE}/stores/${id}`));
  }

  blockStore(id: number, reason: string): Observable<AdminStoreDetail> {
    return this.unwrap(this.http.patch<ApiResponse<AdminStoreDetail>>(`${BASE}/stores/${id}/block`, { reason }));
  }

  unblockStore(id: number): Observable<AdminStoreDetail> {
    return this.unwrap(this.http.patch<ApiResponse<AdminStoreDetail>>(`${BASE}/stores/${id}/unblock`, {}));
  }

  reviewStore(id: number): Observable<AdminStoreDetail> {
    return this.unwrap(this.http.patch<ApiResponse<AdminStoreDetail>>(`${BASE}/stores/${id}/review`, {}));
  }

  searchUsers(params: UserSearchParams = {}): Observable<PageResponse<AdminUserSummary>> {
    return this.unwrap(
      this.http.get<ApiResponse<PageResponse<AdminUserSummary>>>(`${BASE}/users`, { params: toParams(params) })
    );
  }

  getUser(id: number): Observable<AdminUserDetail> {
    return this.unwrap(this.http.get<ApiResponse<AdminUserDetail>>(`${BASE}/users/${id}`));
  }

  suspendUser(id: number, untilIso: string, reason: string): Observable<AdminUserDetail> {
    return this.unwrap(
      this.http.post<ApiResponse<AdminUserDetail>>(`${BASE}/users/${id}/suspension`, { until: untilIso, reason })
    );
  }

  liftSuspension(id: number): Observable<AdminUserDetail> {
    return this.unwrap(this.http.delete<ApiResponse<AdminUserDetail>>(`${BASE}/users/${id}/suspension`));
  }

  decideVerification(
    id: number,
    item: VerificationItem,
    decision: VerificationStatus,
    reason?: string
  ): Observable<AdminUserDetail> {
    return this.unwrap(
      this.http.put<ApiResponse<AdminUserDetail>>(`${BASE}/users/${id}/verification/${item}`, { decision, reason })
    );
  }

  private unwrap<T>(source: Observable<ApiResponse<T>>): Observable<T> {
    return source.pipe(map((res) => res.data));
  }
}

import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../config/api.config';
import { ContactRequestPayload, ContactRequestResult } from '../../models/contact.model';
import { ApiResponse } from '../../models/response.model';

@Service()
export class ContactService {
  private readonly http = inject(HttpClient);

  /** POST /api/contact; failures surface through the shared error-toast interceptor. */
  submit(payload: ContactRequestPayload): Observable<ContactRequestResult> {
    return this.http
      .post<ApiResponse<ContactRequestResult>>(`${API_BASE_URL}/contact`, payload)
      .pipe(map(resp => resp.data));
  }
}

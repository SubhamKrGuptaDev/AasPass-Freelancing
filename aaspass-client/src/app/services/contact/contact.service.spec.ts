import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ContactRequestPayload, ContactRequestResult } from '../../models/contact.model';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  it('posts to /api/contact and unwraps data', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(ContactService);
    const http = TestBed.inject(HttpTestingController);
    const payload: ContactRequestPayload = {
      type: 'QUERY', name: 'Asha', email: 'asha@x.com', subject: 'Hi', message: 'Hello', website: ''
    };
    const data: ContactRequestResult = { id: 1, type: 'QUERY', status: 'NEW', creationDateTime: '2026-10-30T10:00:00' };

    let received: ContactRequestResult | undefined;
    service.submit(payload).subscribe(r => (received = r));

    const req = http.expectOne('/api/contact');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, message: 'ok', data });
    expect(received).toEqual(data);
    http.verify();
  });
});

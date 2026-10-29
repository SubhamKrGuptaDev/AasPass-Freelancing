import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../config/api.config';
import { UserProfile } from '../../models/user.model';
import { AuthService } from '../../services/auth/auth.service';
import { EMPTY_USER_PROFILE } from '../../services/store/store.service';
import { CreateStoreComponent } from './create-store';

// jsdom lacks ResizeObserver and scrollIntoView, which the location pickers' overlay uses.
beforeAll(() => {
  if (typeof Element.prototype.scrollIntoView !== 'function') {
    Element.prototype.scrollIntoView = () => undefined;
  }
  if (typeof globalThis.ResizeObserver !== 'function') {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  }
});

function setup(user: Partial<UserProfile>): { fixture: ComponentFixture<CreateStoreComponent>; http: HttpTestingController } {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
  });
  TestBed.inject(AuthService).setCurrentUser({ ...EMPTY_USER_PROFILE, id: '1', name: 'Aman', ...user });
  const http = TestBed.inject(HttpTestingController);
  const fixture = TestBed.createComponent(CreateStoreComponent);
  http.match(`${API_BASE_URL}/stores`).forEach(r => r.flush({ success: true, message: 'ok', data: [] }));
  fixture.detectChanges();
  http.match(r => r.url.includes('geo/cities')).forEach(r => r.flush([]));
  return { fixture, http };
}

describe('CreateStoreComponent country', () => {
  it('defaults the country control to the user country', () => {
    const { fixture } = setup({ country: 'Canada', city: 'Toronto' });
    expect(fixture.componentInstance.storeForm.controls.country.value).toBe('Canada');
  });

  it('falls back to India when the user has no country', () => {
    const { fixture } = setup({ country: '' });
    expect(fixture.componentInstance.storeForm.controls.country.value).toBe('India');
  });

  it('renders the country and city pickers', () => {
    const { fixture } = setup({ country: 'India' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-country-picker')).not.toBeNull();
    expect(el.querySelector('app-city-picker')).not.toBeNull();
  });

  it('sends the country on create', () => {
    const { fixture, http } = setup({ country: 'Canada', city: 'Toronto' });
    fixture.componentInstance.onSubmit();
    const req = http.expectOne(r => r.method === 'POST' && r.url === `${API_BASE_URL}/stores`);
    expect((req.request.body as { country?: string }).country).toBe('Canada');
  });
});

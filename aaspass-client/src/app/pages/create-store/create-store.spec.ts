import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { StoreService } from '../../services/store/store.service';
import { StoreProfile } from '../../models/store.model';
import { API_BASE_URL } from '../../config/api.config';
import { UserProfile } from '../../models/user.model';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';
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

  it('sends the default availability on create', () => {
    const { fixture, http } = setup({ country: 'Canada', city: 'Toronto' });
    fixture.componentInstance.onSubmit();
    const req = http.expectOne(r => r.method === 'POST' && r.url === `${API_BASE_URL}/stores`);
    const body = req.request.body as { availability?: { slotMinutes: number; ranges: unknown[] } };
    expect(body.availability?.slotMinutes).toBe(30);
    expect(body.availability?.ranges).toHaveLength(6);
  });

  it.each([
    ['country', 'Please select your country and city.'],
    ['city', 'Please select your country and city.']
  ] as const)('blocks submit with a toast and no request when the %s is blank', (field, message) => {
    const { fixture, http } = setup({ country: 'Canada', city: 'Toronto' });
    const cmp = fixture.componentInstance;
    cmp.storeForm.controls[field].setValue('   ');
    cmp.onSubmit();
    http.expectNone(r => r.method === 'POST');
    expect(cmp.isSubmitting()).toBe(false);
    expect(cmp.storeForm.controls[field].touched).toBe(true);
    expect(TestBed.inject(ToastService).toasts().some(t => t.type === 'error' && t.message === message)).toBe(true);
  });
});

describe('CreateStoreComponent edit-mode availability', () => {
  const saved = { slotMinutes: 60, maxBookingMinutes: 120, ranges: [{ day: 'MONDAY', start: '10:00', end: '12:00' }] };

  function setupEdit(): { fixture: ComponentFixture<CreateStoreComponent>; http: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({ editStoreId: '7' })) } }
      ]
    });
    TestBed.inject(AuthService).setCurrentUser({ ...EMPTY_USER_PROFILE, id: '1', name: 'Aman' });
    TestBed.inject(StoreService).stores.set([
      { id: '7', userId: '1', storeName: 'S', category: 'Video & Editing', area: 'A', city: 'Bengaluru', country: 'India', skills: [], socialMediaLinks: [], services: [] } as unknown as StoreProfile
    ]);
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(CreateStoreComponent);
    fixture.detectChanges();
    http.match(r => r.url.includes('geo/cities')).forEach(r => r.flush([]));
    return { fixture, http };
  }

  const availabilityReq = (http: HttpTestingController) =>
    http.expectOne(r => r.method === 'GET' && r.url === `${API_BASE_URL}/stores/7/availability`);

  it('loads saved availability into the editor and sends it on save', () => {
    const { fixture, http } = setupEdit();
    const cmp = fixture.componentInstance;
    expect(cmp.storeForm.controls.availability.disabled).toBe(true);
    availabilityReq(http).flush({ success: true, message: 'ok', data: saved });
    expect(cmp.availabilityLoad()).toBe('loaded');
    expect(cmp.storeForm.controls.availability.value).toEqual(saved);

    cmp.onSubmit();
    const put = http.expectOne(r => r.method === 'PUT' && r.url === `${API_BASE_URL}/stores/7`);
    expect((put.request.body as { availability?: unknown }).availability).toEqual(saved);
  });

  it('omits availability from the update when the load failed', () => {
    const { fixture, http } = setupEdit();
    const cmp = fixture.componentInstance;
    availabilityReq(http).flush({ success: false, message: 'boom' }, { status: 500, statusText: 'Server Error' });
    expect(cmp.availabilityLoad()).toBe('failed');
    expect(cmp.storeForm.controls.availability.disabled).toBe(true);
    expect(TestBed.inject(ToastService).toasts().some(t => t.type === 'error')).toBe(true);

    cmp.onSubmit();
    const put = http.expectOne(r => r.method === 'PUT' && r.url === `${API_BASE_URL}/stores/7`);
    expect('availability' in (put.request.body as object)).toBe(false);
  });

  it('blocks save while availability is still loading', () => {
    const { fixture, http } = setupEdit();
    fixture.componentInstance.onSubmit();
    http.expectNone(r => r.method === 'PUT');
    availabilityReq(http);
  });
});

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { API_BASE_URL } from '../../config/api.config';
import { errorToastInterceptor } from '../../interceptors/error-toast.interceptor';
import { ToastService } from '../../services/toast/toast.service';
import { StoreDetailComponent } from './store-detail';

const REVIEWS_URL = `${API_BASE_URL}/stores/7/reviews`;

describe('StoreDetailComponent reviews', () => {
  let component: StoreDetailComponent;
  let httpTesting: HttpTestingController;
  let toast: ToastService;

  beforeEach(() => {
    const params = convertToParamMap({ storeKey: 'store-7' });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorToastInterceptor])),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: of(params), snapshot: { paramMap: params } } }
      ]
    });
    httpTesting = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService);
    component = TestBed.createComponent(StoreDetailComponent).componentInstance;
    httpTesting.match(`${API_BASE_URL}/stores`).forEach(r => r.flush({ success: true, message: 'ok', data: [] }));
    component.storeService.stores.set([{
      id: 'store-7', userId: '2', ownerName: 'Priya', storeName: 'S', tagline: '', category: 'C', skills: [],
      experienceYears: 1, hourlyRate: 1, startingPrice: 1, area: 'A', city: 'B', country: 'India', serviceRadiusKm: 1,
      socialMediaLinks: [], description: '', services: [], rating: 5, reviewCount: 0, reviews: [],
      avatarUrl: '', bannerGradient: '', isAvailable: true, ownerVerified: false, memberSince: '', creationDateTime: '', lastUpdateDateTime: ''
    }]);
    component.reviewForm.controls.message.setValue('Great work');
  });

  afterEach(() => {
    httpTesting.verify();
    toast.clear();
  });

  it('a double submit posts the review only once', () => {
    component.submitReview();
    component.submitReview();
    expect(component.reviewSubmitting()).toBe(true);

    httpTesting.expectOne(REVIEWS_URL).flush({ success: true, message: 'ok', data: {} });

    expect(component.reviewSubmitting()).toBe(false);
    expect(toast.toasts().filter(t => t.type === 'success').length).toBe(1);
  });

  it('a failed submit can be resent', () => {
    component.submitReview();
    httpTesting.expectOne(REVIEWS_URL).flush({ success: false, message: 'boom' }, { status: 500, statusText: 'Server Error' });
    expect(component.reviewSubmitting()).toBe(false);

    component.submitReview();
    httpTesting.expectOne(REVIEWS_URL).flush({ success: true, message: 'ok', data: {} });
  });
});

describe('StoreDetailComponent verified badge', () => {
  function render(ownerVerified: boolean): HTMLElement {
    const params = convertToParamMap({ storeKey: 'store-7' });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorToastInterceptor])),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: of(params), snapshot: { paramMap: params } } }
      ]
    });
    const httpTesting = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(StoreDetailComponent);
    httpTesting.match(() => true).forEach(r => r.flush({ success: true, message: 'ok', data: [] }));
    fixture.componentInstance.storeService.stores.set([{
      id: 'store-7', userId: '2', ownerName: 'Priya', storeName: 'S', tagline: '', category: 'C', skills: [],
      experienceYears: 1, hourlyRate: 1, startingPrice: 1, area: 'A', city: 'B', country: 'India', serviceRadiusKm: 1,
      socialMediaLinks: [], description: '', services: [], rating: 5, reviewCount: 0, reviews: [],
      avatarUrl: '', bannerGradient: '', isAvailable: true, ownerVerified, memberSince: '', creationDateTime: '', lastUpdateDateTime: ''
    }]);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows no verified badge or VERIFIED pill when the owner is not verified', () => {
    const el = render(false);
    expect(el.querySelector('app-verified-badge')).toBeNull();
    expect(el.textContent).not.toContain('VERIFIED');
  });

  it('shows exactly one verified badge when the owner is verified', () => {
    const el = render(true);
    expect(el.querySelectorAll('app-verified-badge').length).toBe(1);
    expect(el.querySelector('app-verified-badge')?.getAttribute('aria-label')).toBe('Verified');
  });
});

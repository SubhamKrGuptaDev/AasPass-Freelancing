import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../config/api.config';
import { errorToastInterceptor } from '../../interceptors/error-toast.interceptor';
import { UserProfile } from '../../models/user.model';
import { AuthService } from '../../services/auth/auth.service';
import { EMPTY_USER_PROFILE } from '../../services/store/store.service';
import { ToastService } from '../../services/toast/toast.service';
import { ProfileComponent } from './profile';

const USER: UserProfile = { ...EMPTY_USER_PROFILE, id: '1', name: 'Aman', username: 'aman', email: 'a@x.com', phone: '999' };
const USER_URL = `${API_BASE_URL}/users/1`;
const KYC_URL = `${API_BASE_URL}/users/me/kyc`;

describe('ProfileComponent KYC', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let httpTesting: HttpTestingController;
  let toast: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorToastInterceptor])),
        provideHttpClientTesting()
      ]
    });
    TestBed.inject(AuthService).setCurrentUser(USER);
    httpTesting = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    // StoreService loads the public store list on construction; drain it so tests only see their own calls.
    httpTesting.match(`${API_BASE_URL}/stores`).forEach(r => r.flush({ success: true, message: 'ok', data: [] }));
  });

  afterEach(() => {
    httpTesting.verify();
    toast.clear();
  });

  it('profileSaveSendsNoKyc', () => {
    component.startEditUser();
    component.saveUserDetails();

    const req = httpTesting.expectOne(USER_URL);
    expect(req.request.method).toBe('PUT');
    const keys = Object.keys(req.request.body as object);
    expect(keys).not.toContain('aadharNumber');
    expect(keys).not.toContain('panNumber');
    req.flush({ success: true, message: 'ok', data: { id: 1, name: 'Aman', username: 'aman', email: 'a@x.com' } });
  });

  it('only one KYC field is editable at a time and cancel clears the input', () => {
    component.startKycEdit('aadhaar');
    component.kycControl.setValue('1234');
    component.startKycEdit('pan');
    expect(component.editingKyc()).toBe('pan');
    expect(component.kycControl.value).toBe('');
    component.kycControl.setValue('ABC');
    component.cancelKycEdit();
    expect(component.editingKyc()).toBeNull();
    expect(component.kycControl.value).toBe('');
  });

  it('submitKycCallsKycEndpoint on success shows masked value and closes the editor', () => {
    component.startKycEdit('aadhaar');
    component.kycControl.setValue('1234 5678 1234');
    component.submitKyc();

    const req = httpTesting.expectOne(KYC_URL);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ aadharNumber: '1234 5678 1234' });
    req.flush({ success: true, message: 'ok', data: { id: 1, name: 'Aman', username: 'aman', email: 'a@x.com', aadharNumber: 'XXXXXXXX1234' } });

    expect(component.storeService.currentUser().aadharNumber).toBe('XXXXXXXX1234');
    expect(component.editingKyc()).toBeNull();
    expect(component.kycControl.value).toBe('');
    expect(toast.toasts().some(t => t.type === 'success' && t.message === 'Aadhaar updated')).toBe(true);
  });

  it('submitKyc sends an uppercased PAN', () => {
    component.startKycEdit('pan');
    component.kycControl.setValue('abcde1234f');
    expect(component.kycControl.value).toBe('ABCDE1234F');
    component.submitKyc();

    const req = httpTesting.expectOne(KYC_URL);
    expect(req.request.body).toEqual({ panNumber: 'ABCDE1234F' });
    req.flush({ success: true, message: 'ok', data: { id: 1, name: 'Aman', username: 'aman', email: 'a@x.com', panNumber: 'XXXXXX234F' } });
    expect(toast.toasts().some(t => t.message === 'PAN updated')).toBe(true);
  });

  it('submitKyc on 400 shows one error toast and keeps the editor open', () => {
    component.startKycEdit('aadhaar');
    component.kycControl.setValue('12');
    component.submitKyc();

    httpTesting.expectOne(KYC_URL).flush(
      { success: false, message: 'Aadhaar must be 12 digits' },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(component.editingKyc()).toBe('aadhaar');
    expect(component.kycControl.value).toBe('12');
    const errors = toast.toasts().filter(t => t.type === 'error');
    expect(errors.length).toBe(1);
  });

  it('KYC success does not close the editor when another field is now being edited', () => {
    component.startKycEdit('aadhaar');
    component.kycControl.setValue('123456781234');
    component.submitKyc();
    // While saving, switching fields and cancelling are blocked.
    component.startKycEdit('pan');
    expect(component.editingKyc()).toBe('aadhaar');
    // Force the race the guard protects against: editor moved on before the response arrives.
    component.editingKyc.set('pan');
    httpTesting.expectOne(KYC_URL).flush({ success: true, message: 'ok', data: { id: 1, name: 'Aman', username: 'aman', email: 'a@x.com', aadharNumber: 'XXXXXXXX1234' } });
    expect(component.editingKyc()).toBe('pan');
  });

  it('moves focus into the KYC input on Update and back to Update on Cancel', async () => {
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    document.body.appendChild(root);
    root.querySelector<HTMLButtonElement>('#kyc-aadhaar-update')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.id).toBe('kyc-aadhaar-input');
    expect(document.activeElement?.getAttribute('aria-describedby')).toBe('kyc-aadhaar-hint');
    expect(root.querySelector('#kyc-aadhaar-hint')?.textContent).toContain('12 digits');

    component.cancelKycEdit();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.id).toBe('kyc-aadhaar-update');
    root.remove();
  });

  describe('store reviews', () => {
    const REVIEWS_URL = `${API_BASE_URL}/stores/7/reviews`;

    beforeEach(() => {
      component.storeService.stores.set([{
        id: 'store-7', userId: '1', ownerName: 'Aman', storeName: 'S', tagline: '', category: 'C', skills: [],
        experienceYears: 1, hourlyRate: 1, startingPrice: 1, area: 'A', city: 'B', distanceKm: 1, serviceRadiusKm: 1,
        socialMediaLinks: [], description: '', services: [], rating: 5, reviewCount: 0, reviews: [],
        avatarUrl: '', bannerGradient: '', isAvailable: true, memberSince: '', creationDateTime: '', lastUpdateDateTime: ''
      }]);
      component.isAddingReview = true;
      component.reviewForm.controls.message.setValue('Great work');
    });

    it('200 inserts the review under the session user name and shows one success toast', () => {
      component.submitStoreReview('store-7');
      expect(toast.toasts().length).toBe(0);
      expect(component.storeService.getStoreById('store-7')?.reviews?.length).toBe(0);

      const req = httpTesting.expectOne(REVIEWS_URL);
      expect(Object.keys(req.request.body as object).sort()).toEqual(['message', 'rating']);
      req.flush({ success: true, message: 'ok', data: {} });

      const reviews = component.storeService.getStoreById('store-7')?.reviews ?? [];
      expect(reviews.length).toBe(1);
      expect(reviews[0].userName).toBe('Aman');
      expect(toast.toasts().filter(t => t.type === 'success').length).toBe(1);
      expect(component.isAddingReview).toBe(false);
    });

    it('a double submit posts the review only once', () => {
      component.submitStoreReview('store-7');
      component.submitStoreReview('store-7');
      expect(component.reviewSubmitting()).toBe(true);

      httpTesting.expectOne(REVIEWS_URL).flush({ success: true, message: 'ok', data: {} });

      expect(component.reviewSubmitting()).toBe(false);
      expect(component.storeService.getStoreById('store-7')?.reviews?.length).toBe(1);
    });

    it('500 shows no success toast and inserts no review', () => {
      component.submitStoreReview('store-7');
      httpTesting.expectOne(REVIEWS_URL).flush({ success: false, message: 'boom' }, { status: 500, statusText: 'Server Error' });

      expect(toast.toasts().some(t => t.type === 'success')).toBe(false);
      expect(component.storeService.getStoreById('store-7')?.reviews?.length).toBe(0);
      expect(component.isAddingReview).toBe(true);
      expect(component.reviewSubmitting()).toBe(false);
    });
  });
});

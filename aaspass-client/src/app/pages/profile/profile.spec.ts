import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
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
    component = TestBed.createComponent(ProfileComponent).componentInstance;
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
    component.kycInput.set('1234');
    component.startKycEdit('pan');
    expect(component.editingKyc()).toBe('pan');
    expect(component.kycInput()).toBe('');
    component.kycInput.set('ABC');
    component.cancelKycEdit();
    expect(component.editingKyc()).toBeNull();
    expect(component.kycInput()).toBe('');
  });

  it('submitKycCallsKycEndpoint on success shows masked value and closes the editor', () => {
    component.startKycEdit('aadhaar');
    component.kycInput.set('1234 5678 1234');
    component.submitKyc();

    const req = httpTesting.expectOne(KYC_URL);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ aadharNumber: '1234 5678 1234' });
    req.flush({ success: true, message: 'ok', data: { id: 1, name: 'Aman', username: 'aman', email: 'a@x.com', aadharNumber: 'XXXXXXXX1234' } });

    expect(component.storeService.currentUser().aadharNumber).toBe('XXXXXXXX1234');
    expect(component.editingKyc()).toBeNull();
    expect(component.kycInput()).toBe('');
    expect(toast.toasts().some(t => t.type === 'success' && t.message === 'Aadhaar updated')).toBe(true);
  });

  it('submitKyc sends an uppercased PAN', () => {
    component.startKycEdit('pan');
    component.setKycInput('abcde1234f');
    expect(component.kycInput()).toBe('ABCDE1234F');
    component.submitKyc();

    const req = httpTesting.expectOne(KYC_URL);
    expect(req.request.body).toEqual({ panNumber: 'ABCDE1234F' });
    req.flush({ success: true, message: 'ok', data: { id: 1, name: 'Aman', username: 'aman', email: 'a@x.com', panNumber: 'XXXXXX234F' } });
    expect(toast.toasts().some(t => t.message === 'PAN updated')).toBe(true);
  });

  it('submitKyc on 400 shows one error toast and keeps the editor open', () => {
    component.startKycEdit('aadhaar');
    component.kycInput.set('12');
    component.submitKyc();

    httpTesting.expectOne(KYC_URL).flush(
      { success: false, message: 'Aadhaar must be 12 digits' },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(component.editingKyc()).toBe('aadhaar');
    expect(component.kycInput()).toBe('12');
    const errors = toast.toasts().filter(t => t.type === 'error');
    expect(errors.length).toBe(1);
  });
});

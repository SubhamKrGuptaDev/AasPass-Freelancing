import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminAuthService } from '../../services/admin-auth.service';
import { LoginPage } from './login';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let el: HTMLElement;
  let auth: AdminAuthService;
  let router: Router;

  const setup = (returnUrl?: string) => {
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([])]
    });
    auth = TestBed.inject(AdminAuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginPage);
    if (returnUrl) {
      fixture.componentRef.setInput('returnUrl', returnUrl);
    }
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  };

  const type = (id: string, value: string) => {
    const input = el.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const submitButton = () => el.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  const fillAndSubmit = () => {
    type('email', 'a@b.c');
    type('password', 'secret');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
  };

  it('disablesSubmitWhileInvalid', () => {
    setup();
    expect(submitButton().disabled).toBe(true);
    expect(submitButton().textContent).toContain('Sign in');
  });

  it('showsRequiredErrorsAfterTouch', () => {
    setup();
    el.querySelector<HTMLInputElement>('#email')!.dispatchEvent(new Event('blur'));
    el.querySelector<HTMLInputElement>('#password')!.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(el.textContent).toContain('Email is required');
    expect(el.textContent).toContain('Password is required');
  });

  it('logsInAndNavigatesToDashboardByDefault', () => {
    setup();
    const login = vi.spyOn(auth, 'login').mockReturnValue(of({ id: 1, name: 'Root', email: 'a@b.c' }));
    type('email', 'a@b.c');
    type('password', 'secret');
    expect(submitButton().disabled).toBe(false);
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    expect(login).toHaveBeenCalledWith('a@b.c', 'secret');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('navigatesToReturnUrl', () => {
    setup('/users');
    vi.spyOn(auth, 'login').mockReturnValue(of({ id: 1, name: 'Root', email: 'a@b.c' }));
    fillAndSubmit();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/users');
  });

  it('ignoresExternalReturnUrl', () => {
    setup('https://evil.example');
    vi.spyOn(auth, 'login').mockReturnValue(of({ id: 1, name: 'Root', email: 'a@b.c' }));
    fillAndSubmit();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });
});

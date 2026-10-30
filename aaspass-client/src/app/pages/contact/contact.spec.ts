import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { ContactRequestPayload, ContactRequestResult } from '../../models/contact.model';
import { UserProfile } from '../../models/user.model';
import { AuthService } from '../../services/auth/auth.service';
import { ContactService } from '../../services/contact/contact.service';
import { ContactComponent } from './contact';

const RESULT: ContactRequestResult = { id: 1, type: 'QUERY', status: 'NEW', creationDateTime: '2026-10-30T10:00:00' };

function setup(opts: { user?: Partial<UserProfile> | null; type?: string; submit?: () => Observable<ContactRequestResult> } = {}) {
  const submit = vi.fn<(payload: ContactRequestPayload) => Observable<ContactRequestResult>>(opts.submit ?? ((): Observable<ContactRequestResult> => of(RESULT)));
  const user = opts.user ? ({ name: '', email: '', phone: '', ...opts.user } as UserProfile) : null;
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: { currentUser: signal<UserProfile | null>(user) } },
      { provide: ContactService, useValue: { submit } },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(opts.type ? { type: opts.type } : {}) } } }
    ]
  });
  const fixture: ComponentFixture<ContactComponent> = TestBed.createComponent(ContactComponent);
  fixture.detectChanges();
  return { fixture, submit, el: fixture.nativeElement as HTMLElement };
}

function setValue(el: HTMLElement, selector: string, value: string): void {
  const input = el.querySelector(selector) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function fillValid(fixture: ComponentFixture<ContactComponent>, el: HTMLElement): void {
  setValue(el, '#contact-name', 'Asha');
  setValue(el, '#contact-email', 'asha@x.com');
  setValue(el, '#contact-subject', 'Hello');
  setValue(el, '#contact-message', 'A question about my store.');
  fixture.detectChanges();
}

function clickSubmit(fixture: ComponentFixture<ContactComponent>, el: HTMLElement): void {
  (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
  fixture.detectChanges();
}

describe('ContactComponent', () => {
  it('prefills name, email and phone for a logged-in user', () => {
    const { el } = setup({ user: { name: 'Asha', email: 'asha@x.com', phone: '999' } });
    expect((el.querySelector('#contact-name') as HTMLInputElement).value).toBe('Asha');
    expect((el.querySelector('#contact-email') as HTMLInputElement).value).toBe('asha@x.com');
    expect((el.querySelector('#contact-phone') as HTMLInputElement).value).toBe('999');
  });

  it('leaves fields empty for a guest', () => {
    const { el } = setup();
    expect((el.querySelector('#contact-name') as HTMLInputElement).value).toBe('');
    expect((el.querySelector('#contact-email') as HTMLInputElement).value).toBe('');
    expect((el.querySelector('#contact-phone') as HTMLInputElement).value).toBe('');
  });

  it('preselects type from ?type=feedback', () => {
    const { fixture } = setup({ type: 'Feedback' });
    expect(fixture.componentInstance.form.controls.type.value).toBe('FEEDBACK');
  });

  it('defaults an unknown type to QUERY', () => {
    const { fixture } = setup({ type: 'bogus' });
    expect(fixture.componentInstance.form.controls.type.value).toBe('QUERY');
  });

  it('does not submit an invalid form', () => {
    const { fixture, submit, el } = setup();
    clickSubmit(fixture, el);
    expect(submit).not.toHaveBeenCalled();
    expect(el.querySelector('#contact-name-error')).not.toBeNull();
  });

  it('shows the success panel after submit', () => {
    const { fixture, submit, el } = setup({ type: 'complaint' });
    fillValid(fixture, el);
    clickSubmit(fixture, el);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(el.textContent).toContain("Thanks — we'll get back to you within 24–48 hours.");
    expect(el.querySelector('form')).toBeNull();

    const another = Array.from(el.querySelectorAll('button')).find(b => b.textContent?.includes('Send another')) as HTMLButtonElement;
    another.click();
    fixture.detectChanges();
    expect(el.querySelector('form')).not.toBeNull();
    expect(fixture.componentInstance.form.controls.type.value).toBe('QUERY');
  });

  it('keeps values after an error', () => {
    const { fixture, el } = setup({ submit: () => throwError(() => new Error('boom')) });
    fillValid(fixture, el);
    clickSubmit(fixture, el);
    expect(el.querySelector('form')).not.toBeNull();
    expect((el.querySelector('#contact-subject') as HTMLInputElement).value).toBe('Hello');
    expect((el.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(false);
  });

  it('sends website from the hidden honeypot input', () => {
    const { fixture, submit, el } = setup();
    fillValid(fixture, el);
    clickSubmit(fixture, el);
    const payload = submit.mock.calls[0][0];
    expect(payload.website).toBe('');
  });
});

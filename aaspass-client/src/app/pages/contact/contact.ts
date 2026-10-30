import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { notBlank } from '../../forms/validators';
import { CONTACT_TYPE_OPTIONS, ContactRequestPayload, ContactRequestType } from '../../models/contact.model';
import { AuthService } from '../../services/auth/auth.service';
import { ContactService } from '../../services/contact/contact.service';
import { ToastService } from '../../services/toast/toast.service';

export const CONTACT_LIMITS = { name: 100, email: 100, phone: 25, subject: 150, message: 2000 } as const;

/** Maps the ?type= query param (case-insensitive) to a request type; anything else is a QUERY. */
export function contactTypeFromParam(param: string | null | undefined): ContactRequestType {
  const match = CONTACT_TYPE_OPTIONS.find(o => o.value === param?.trim().toUpperCase());
  return match?.value ?? 'QUERY';
}

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, HlmButtonImports, HlmCardImports, HlmInputImports, HlmTextareaImports],
  templateUrl: './contact.html'
})
export class ContactComponent {
  private readonly contactService = inject(ContactService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  protected readonly typeOptions = CONTACT_TYPE_OPTIONS;
  protected readonly limits = CONTACT_LIMITS;

  readonly submitted = signal(false);
  readonly sending = signal(false);
  /** True once the user has tried to submit, so errors show on untouched fields too. */
  protected readonly attempted = signal(false);

  readonly form = new FormGroup({
    type: new FormControl<ContactRequestType>('QUERY', { nonNullable: true }),
    name: new FormControl('', { nonNullable: true, validators: [notBlank, Validators.maxLength(CONTACT_LIMITS.name)] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [notBlank, Validators.email, Validators.maxLength(CONTACT_LIMITS.email)]
    }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(CONTACT_LIMITS.phone)] }),
    subject: new FormControl('', { nonNullable: true, validators: [notBlank, Validators.maxLength(CONTACT_LIMITS.subject)] }),
    message: new FormControl('', { nonNullable: true, validators: [notBlank, Validators.maxLength(CONTACT_LIMITS.message)] }),
    website: new FormControl('', { nonNullable: true })
  });

  private readonly messageValue = toSignal(this.form.controls.message.valueChanges, { initialValue: '' });
  protected readonly messageLength = computed(() => this.messageValue()?.length ?? 0);

  constructor() {
    this.resetForm();
  }

  /** Whether the named control should display its error message. */
  protected showError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.attempted());
  }

  protected errorText(name: 'name' | 'email' | 'phone' | 'subject' | 'message'): string {
    const errors = this.form.controls[name].errors;
    if (errors?.['maxlength']) return `Must be at most ${CONTACT_LIMITS[name]} characters.`;
    if (errors?.['email']) return 'Enter a valid email address.';
    return 'This field is required.';
  }

  protected submit(): void {
    this.attempted.set(true);
    if (this.form.invalid || this.sending()) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const phone = value.phone.trim();
    const payload: ContactRequestPayload = {
      type: value.type,
      name: value.name.trim(),
      email: value.email.trim(),
      ...(phone ? { phone } : {}),
      subject: value.subject.trim(),
      message: value.message.trim(),
      website: value.website ?? ''
    };
    this.sending.set(true);
    this.contactService.submit(payload).subscribe({
      next: () => {
        this.sending.set(false);
        this.submitted.set(true);
        this.toast.success('Your message has been sent.');
      },
      // The error-toast interceptor reports the failure; keep the form and its values as they are.
      error: () => this.sending.set(false)
    });
  }

  protected sendAnother(): void {
    this.submitted.set(false);
    this.attempted.set(false);
    this.form.reset();
    this.resetForm();
    this.form.controls.type.setValue('QUERY');
  }

  /** Applies the ?type= preselection and the logged-in user's prefill (fields stay editable). */
  private resetForm(): void {
    const user = this.auth.currentUser();
    this.form.patchValue({
      type: contactTypeFromParam(this.route.snapshot?.queryParamMap?.get('type')),
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? ''
    });
  }
}

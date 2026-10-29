import { Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { AdminAuthService } from '../../services/admin-auth.service';

const DEFAULT_ROUTE = '/dashboard';

/** Admin sign-in form. Failures are reported by the error-toast interceptor. */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, HlmButtonImports, HlmInputImports],
  templateUrl: './login.html'
})
export class LoginPage {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  /** Bound from the `returnUrl` query parameter. */
  readonly returnUrl = input<string | undefined>();

  readonly submitting = signal(false);

  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.auth.login(email.trim(), password).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigateByUrl(this.safeReturnUrl());
      },
      error: () => this.submitting.set(false)
    });
  }

  /** Only same-app absolute paths are honoured, so the query parameter cannot redirect off-site. */
  private safeReturnUrl(): string {
    const url = this.returnUrl();
    return url && url.startsWith('/') && !url.startsWith('//') ? url : DEFAULT_ROUTE;
  }
}

import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, of, switchMap, tap } from 'rxjs';
import { StatusChipComponent } from '../../components/status-chip/status-chip';
import { AdminUserDetail } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { ToastService } from '../../services/toast.service';
import { HlmSkeleton } from '../../ui/skeleton/src';
import { SuspendDialogComponent, SuspensionRequest } from './suspend-dialog/suspend-dialog';
import { VerificationPanelComponent } from './verification-panel/verification-panel';

/** Moderation view of one user: profile, verification review, stores and suspension. */
@Component({
  selector: 'app-user-detail',
  imports: [DatePipe, RouterLink, StatusChipComponent, VerificationPanelComponent, SuspendDialogComponent, HlmSkeleton],
  templateUrl: './user-detail.html'
})
export class UserDetailPage {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly suspendDialog = viewChild.required(SuspendDialogComponent);

  protected readonly user = signal<AdminUserDetail | null>(null);
  protected readonly loadFailed = signal(false);
  protected readonly busy = signal(false);

  /** The id of the loaded route; null until the first load (or when the route id is invalid). */
  private readonly userId = signal<number | null>(null);

  protected readonly suspendedUntil = computed(() => {
    const until = this.user()?.summary?.suspendedUntil;
    return until && new Date(until).getTime() > Date.now() ? until : null;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.user.set(null);
          this.loadFailed.set(false);
          this.userId.set(null);
        }),
        switchMap((p) => {
          const id = Number(p.get('id'));
          if (!p.get('id') || !Number.isFinite(id)) {
            this.loadFailed.set(true);
            return of(null);
          }
          this.userId.set(id);
          return this.api.getUser(id).pipe(
            catchError(() => {
              this.loadFailed.set(true);
              return of(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((u) => this.user.set(u));
  }

  protected onVerificationChanged(updated: AdminUserDetail): void {
    this.user.set(updated);
  }

  protected openSuspendDialog(): void {
    this.suspendDialog().open();
  }

  protected suspend(request: SuspensionRequest): void {
    const id = this.userId();
    if (id !== null) {
      this.run(this.api.suspendUser(id, request.until, request.reason), 'User suspended.');
    }
  }

  protected lift(): void {
    const id = this.userId();
    if (id !== null) {
      this.run(this.api.liftSuspension(id), 'Suspension lifted.');
    }
  }

  private run(request: Observable<AdminUserDetail>, successMessage: string): void {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.user.set(updated);
        this.busy.set(false);
        this.toast.success(successMessage);
      },
      error: () => this.busy.set(false)
    });
  }
}

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

/** Route ids are plain positive decimal integers (no sign, exponent, fraction or whitespace). */
const POSITIVE_INTEGER = /^\d+$/;

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
          // A mutation still pending for the previous user must not block this one; run() drops its response.
          this.busy.set(false);
        }),
        switchMap((p) => {
          const raw = p.get('id') ?? '';
          const id = POSITIVE_INTEGER.test(raw) ? Number(raw) : NaN;
          if (!Number.isSafeInteger(id) || id <= 0) {
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
    if (this.isCurrent(updated)) {
      this.user.set(updated);
    }
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

  /**
   * Runs one mutation for the current user. If the route moves to another user while it is pending,
   * its response (or error) is dropped so it cannot overwrite the newly loaded user or their busy state.
   */
  private run(request: Observable<AdminUserDetail>, successMessage: string): void {
    if (this.busy()) {
      return;
    }
    const requestedFor = this.userId();
    this.busy.set(true);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        if (this.userId() !== requestedFor || !this.isCurrent(updated)) {
          return;
        }
        this.user.set(updated);
        this.busy.set(false);
        this.toast.success(successMessage);
      },
      error: () => {
        if (this.userId() === requestedFor) {
          this.busy.set(false);
        }
      }
    });
  }

  /** @return true when {@code updated} belongs to the user currently shown by the route. */
  private isCurrent(updated: AdminUserDetail | null | undefined): updated is AdminUserDetail {
    const id = this.userId();
    return id !== null && updated?.summary?.id === id;
  }
}

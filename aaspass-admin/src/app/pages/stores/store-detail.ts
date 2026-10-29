import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { ReasonDialogComponent } from '../../components/reason-dialog/reason-dialog';
import { ChipStatus, StatusChipComponent } from '../../components/status-chip/status-chip';
import { PUBLIC_SITE_URL } from '../../config';
import { AdminStoreDetail } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { ToastService } from '../../services/toast.service';
import { HlmSkeleton } from '../../ui/skeleton/src';

/** Moderation view of one store: summary, owner and the review/block/unblock actions. */
@Component({
  selector: 'app-store-detail',
  imports: [DatePipe, RouterLink, StatusChipComponent, ReasonDialogComponent, HlmSkeleton],
  templateUrl: './store-detail.html'
})
export class StoreDetailPage {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly blockDialog = viewChild.required(ReasonDialogComponent);

  protected readonly store = signal<AdminStoreDetail | null>(null);
  protected readonly loadFailed = signal(false);
  protected readonly busy = signal(false);

  private readonly storeId = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: Number(this.route.snapshot.paramMap.get('id')) }
  );

  protected readonly status = computed<ChipStatus>(() => {
    const summary = this.store()?.summary;
    if (summary?.adminBlocked) {
      return 'blocked';
    }
    return summary?.isActive ? 'active' : 'inactive';
  });

  protected readonly publicUrl = computed(() => `${PUBLIC_SITE_URL}/stores/${this.storeId()}`);

  constructor() {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.store.set(null);
          this.loadFailed.set(false);
        }),
        switchMap((p) =>
          this.api.getStore(Number(p.get('id'))).pipe(
            catchError(() => {
              this.loadFailed.set(true);
              return of(null);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((s) => this.store.set(s));
  }

  protected openBlockDialog(): void {
    this.blockDialog().open();
  }

  protected block(reason: string): void {
    this.run(this.api.blockStore(this.storeId(), reason), 'Store blocked.');
  }

  protected unblock(): void {
    this.run(this.api.unblockStore(this.storeId()), 'Store unblocked.');
  }

  protected markReviewed(): void {
    this.run(this.api.reviewStore(this.storeId()), 'Store marked as reviewed.');
  }

  private run(request: Observable<AdminStoreDetail>, successMessage: string): void {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.store.set(updated);
        this.busy.set(false);
        this.toast.success(successMessage);
      },
      error: () => this.busy.set(false)
    });
  }
}

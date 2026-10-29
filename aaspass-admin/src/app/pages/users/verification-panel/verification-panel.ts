import { Component, DestroyRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { ReasonDialogComponent } from '../../../components/reason-dialog/reason-dialog';
import { ChipStatus, StatusChipComponent } from '../../../components/status-chip/status-chip';
import { AdminUserDetail, VerificationItem, VerificationStatus } from '../../../models/admin.models';
import { AdminApiService } from '../../../services/admin-api.service';
import { ToastService } from '../../../services/toast.service';

interface VerificationRow {
  item: VerificationItem;
  label: string;
  value: string | null;
  status: VerificationStatus;
  chip: ChipStatus;
  reason: string | null;
}

const CHIPS: Record<VerificationStatus, ChipStatus> = {
  UNVERIFIED: 'unverified',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

/** Chip shown for a verification status; shared with the users list. */
export function verificationChip(status: VerificationStatus | null | undefined): ChipStatus {
  return CHIPS[status ?? 'UNVERIFIED'];
}

/** Per-item (mobile, PAN, Aadhaar) verification review: shows the full value and lets an admin verify or reject it. */
@Component({
  selector: 'app-verification-panel',
  imports: [StatusChipComponent, ReasonDialogComponent],
  template: `
    <ul class="divide-y divide-slate-100 dark:divide-slate-800">
      @for (row of rows(); track row.item) {
        <li class="flex flex-wrap items-start justify-between gap-3 py-3" data-testid="row">
          <div>
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ row.label }}</p>
            <p class="text-sm text-slate-900 dark:text-slate-100">{{ row.value ?? 'Not provided' }}</p>
            @if (row.status === 'REJECTED' && row.reason) {
              <p class="mt-1 text-sm text-rose-800 dark:text-rose-200">Reason: {{ row.reason }}</p>
            }
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <app-status-chip [status]="row.chip" />
            @if (row.status !== 'VERIFIED') {
              <button
                type="button"
                class="rounded-md bg-slate-900 dark:bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                [attr.aria-label]="'Verify ' + row.label"
                [disabled]="row.value === null || busy()"
                (click)="verify(row)"
              >
                Verify
              </button>
            }
            <button
              type="button"
              class="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              [attr.aria-label]="'Reject ' + row.label"
              [disabled]="row.value === null || busy()"
              (click)="openReject(row)"
            >
              Reject
            </button>
          </div>
        </li>
      }
    </ul>

    <app-reason-dialog [title]="rejectTitle()" confirmLabel="Reject" (confirmed)="reject($event)" (cancelled)="pending.set(null)" />
  `
})
export class VerificationPanelComponent {
  readonly detail = input.required<AdminUserDetail>();
  readonly changed = output<AdminUserDetail>();

  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly rejectDialog = viewChild.required(ReasonDialogComponent);

  protected readonly busy = signal(false);
  protected readonly pending = signal<VerificationRow | null>(null);
  protected readonly rejectTitle = computed(() => `Reject ${this.pending()?.label ?? 'item'}`);

  protected readonly rows = computed<VerificationRow[]>(() => {
    const d = this.detail();
    const v = d.verification;
    return [
      this.row('phone', 'Mobile number', d.phone, v?.phone?.status, v?.phone?.reason),
      this.row('pan', 'PAN card', d.panNumber, v?.pan?.status, v?.pan?.reason),
      this.row('aadhar', 'Aadhaar card', d.aadharNumber, v?.aadhar?.status, v?.aadhar?.reason)
    ];
  });

  protected verify(row: VerificationRow): void {
    this.decide(row, 'VERIFIED');
  }

  protected openReject(row: VerificationRow): void {
    this.pending.set(row);
    this.rejectDialog().open();
  }

  protected reject(reason: string): void {
    const row = this.pending();
    this.pending.set(null);
    if (row) {
      this.decide(row, 'REJECTED', reason);
    }
  }

  private decide(row: VerificationRow, decision: VerificationStatus, reason?: string): void {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    const request: Observable<AdminUserDetail> =
      reason === undefined
        ? this.api.decideVerification(this.detail().summary.id, row.item, decision)
        : this.api.decideVerification(this.detail().summary.id, row.item, decision, reason);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.toast.success(decision === 'VERIFIED' ? `${row.label} verified.` : `${row.label} rejected.`);
        this.changed.emit(updated);
      },
      error: () => this.busy.set(false)
    });
  }

  private row(
    item: VerificationItem,
    label: string,
    value: string | null,
    status: VerificationStatus | undefined,
    reason: string | null | undefined
  ): VerificationRow {
    const resolved = status ?? 'UNVERIFIED';
    return { item, label, value: value?.trim() ? value : null, status: resolved, chip: verificationChip(resolved), reason: reason ?? null };
  }
}

import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { StatusChipComponent } from '../../components/status-chip/status-chip';
import { AdminContactRequestDetail, ContactRequestStatus, ContactRequestUpdate } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { ToastService } from '../../services/toast.service';
import { HlmSkeleton } from '../../ui/skeleton/src';
import { CONTACT_TYPE_LABELS, toChipStatus } from './contact-status';

const STATUS_VALUES: readonly ContactRequestStatus[] = ['NEW', 'IN_PROGRESS', 'RESOLVED'];
const STATUS_LABELS: Record<ContactRequestStatus, string> = { NEW: 'New', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved' };

/** One contact or feedback request: sender details, the message and the admin handling form. */
@Component({
  selector: 'app-support-detail',
  imports: [DatePipe, RouterLink, StatusChipComponent, HlmSkeleton],
  templateUrl: './support-detail.html'
})
export class SupportDetailPage {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly request = signal<AdminContactRequestDetail | null>(null);
  protected readonly notFound = signal(false);
  protected readonly loadFailed = signal(false);
  protected readonly busy = signal(false);

  protected readonly statusDraft = signal<ContactRequestStatus>('NEW');
  protected readonly noteDraft = signal('');

  protected readonly statusValues = STATUS_VALUES;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly typeLabels = CONTACT_TYPE_LABELS;
  protected readonly chipFor = toChipStatus;

  /** Only the fields that differ from the loaded request; empty when nothing changed. */
  private readonly changes = computed<ContactRequestUpdate>(() => {
    const r = this.request();
    if (!r) {
      return {};
    }
    const update: ContactRequestUpdate = {};
    if (this.statusDraft() !== r.status) {
      update.status = this.statusDraft();
    }
    if (this.noteDraft().trim() !== (r.adminNote ?? '').trim()) {
      update.adminNote = this.noteDraft();
    }
    return update;
  });

  protected readonly dirty = computed(() => Object.keys(this.changes()).length > 0);

  constructor() {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.request.set(null);
          this.notFound.set(false);
          this.loadFailed.set(false);
        }),
        switchMap((p) =>
          this.api.getContactRequest(Number(p.get('id'))).pipe(
            catchError((err: unknown) => {
              if (err instanceof HttpErrorResponse && err.status === 404) {
                this.notFound.set(true);
              } else {
                this.loadFailed.set(true);
              }
              return of(null);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((r) => this.load(r));
  }

  protected onStatus(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const match = STATUS_VALUES.find((s) => s === value);
    if (match) {
      this.statusDraft.set(match);
    }
  }

  protected onNote(event: Event): void {
    this.noteDraft.set((event.target as HTMLTextAreaElement).value);
  }

  protected save(): void {
    const r = this.request();
    const body = this.changes();
    if (!r || this.busy() || Object.keys(body).length === 0) {
      return;
    }
    this.busy.set(true);
    this.api
      .updateContactRequest(r.id, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.load(updated);
          this.busy.set(false);
          this.toast.success('Request updated.');
        },
        error: () => this.busy.set(false)
      });
  }

  /** Replaces the loaded request and resets the form to match it. */
  private load(r: AdminContactRequestDetail | null): void {
    this.request.set(r);
    if (r) {
      this.statusDraft.set(r.status);
      this.noteDraft.set(r.adminNote ?? '');
    }
  }
}

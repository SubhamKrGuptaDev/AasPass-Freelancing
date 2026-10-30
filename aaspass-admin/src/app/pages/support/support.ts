import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { PagerComponent } from '../../components/pager/pager';
import { SearchSelectComponent, SearchSelectOption } from '../../components/search-select/search-select';
import { StatusChipComponent } from '../../components/status-chip/status-chip';
import { AdminContactRequestSummary, ContactRequestSearchParams, PageResponse } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { HlmSkeleton } from '../../ui/skeleton/src';
import { CONTACT_TYPE_LABELS, toChipStatus } from './contact-status';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
const STATUS_VALUES = ['NEW', 'IN_PROGRESS', 'RESOLVED'] as const;
const TYPE_VALUES = ['QUERY', 'FEEDBACK', 'COMPLAINT'] as const;

const STATUS_OPTIONS: readonly SearchSelectOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'RESOLVED', label: 'Resolved' }
];

const TYPE_OPTIONS: readonly SearchSelectOption[] = [
  { value: 'all', label: 'All types' },
  { value: 'QUERY', label: 'Query' },
  { value: 'FEEDBACK', label: 'Feedback' },
  { value: 'COMPLAINT', label: 'Complaint' }
];

/** Inbox of contact and feedback requests; the filter state lives in the URL query string. */
@Component({
  selector: 'app-support',
  imports: [DatePipe, StatusChipComponent, PagerComponent, HlmSkeleton, SearchSelectComponent],
  templateUrl: './support.html'
})
export class SupportPage {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly typeOptions = TYPE_OPTIONS;
  protected readonly typeLabels = CONTACT_TYPE_LABELS;
  protected readonly chipFor = toChipStatus;

  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  protected readonly q = computed(() => this.params().get('q') ?? '');
  protected readonly status = computed(() => {
    const raw = this.params().get('status');
    return STATUS_VALUES.find((s) => s === raw) ?? 'all';
  });
  protected readonly type = computed(() => {
    const raw = this.params().get('type');
    return TYPE_VALUES.find((t) => t === raw) ?? 'all';
  });
  protected readonly page = computed(() => {
    const parsed = Number(this.params().get('page'));
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
  });

  private readonly query = computed<ContactRequestSearchParams>(() => ({
    q: this.q() || undefined,
    status: this.status(),
    type: this.type(),
    page: this.page(),
    size: PAGE_SIZE
  }));

  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  protected readonly result = toSignal(
    toObservable(this.query).pipe(
      tap(() => {
        this.loading.set(true);
        this.failed.set(false);
      }),
      switchMap((q) =>
        this.api.searchContactRequests(q).pipe(
          catchError(() => {
            this.failed.set(true);
            return of<PageResponse<AdminContactRequestSummary> | null>(null);
          })
        )
      ),
      tap(() => this.loading.set(false))
    ),
    { initialValue: null }
  );

  protected readonly rows = computed(() => this.result()?.content ?? []);
  protected readonly totalPages = computed(() => this.result()?.totalPages ?? 0);
  protected readonly skeletonRows = [1, 2, 3, 4, 5];

  /** Text typed in the search box, kept apart from the URL until the debounce fires. */
  protected readonly qDraft = signal<string | null>(null);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearTimer());
    // A URL change from elsewhere supersedes any unsent draft.
    toObservable(this.q)
      .pipe(map(() => null), takeUntilDestroyed())
      .subscribe((v) => this.qDraft.set(v));
  }

  protected onStatus(value: string): void {
    this.updateFilters({ status: value });
  }

  protected onType(value: string): void {
    this.updateFilters({ type: value });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.qDraft.set(value);
    this.clearTimer();
    this.searchTimer = setTimeout(() => {
      this.searchTimer = null;
      this.updateFilters({ q: value.trim() });
    }, SEARCH_DEBOUNCE_MS);
  }

  protected open(id: number): void {
    void this.router.navigate(['/support', id]);
  }

  protected goToPage(page: number): void {
    this.navigate({ page });
  }

  /** Any filter change returns to the first page. */
  private updateFilters(changes: Record<string, string>): void {
    const normalised: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(changes)) {
      normalised[key] = value === '' || value === 'all' ? null : value;
    }
    this.navigate({ ...normalised, page: 0 });
  }

  private navigate(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  private clearTimer(): void {
    if (this.searchTimer !== null) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
  }
}

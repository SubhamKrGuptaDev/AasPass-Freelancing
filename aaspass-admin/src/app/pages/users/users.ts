import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { PagerComponent } from '../../components/pager/pager';
import { StatusChipComponent } from '../../components/status-chip/status-chip';
import { AdminUserSummary, PageResponse, UserSearchParams, UserVerificationFilter } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { HlmSkeleton } from '../../ui/skeleton/src';
import { verificationChip } from './verification-panel/verification-panel';
import { SearchSelectComponent } from '../../components/search-select/search-select';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
const VERIFICATION_FILTERS: readonly UserVerificationFilter[] = ['all', 'pending', 'verified', 'rejected'];

type SuspendedFilter = 'all' | 'true' | 'false';
const SUSPENDED_FILTERS: readonly SuspendedFilter[] = ['all', 'true', 'false'];

interface Option<T extends string> {
  value: T;
  label: string;
}

const VERIFICATION_OPTIONS: readonly Option<UserVerificationFilter>[] = [
  { value: 'all', label: 'All verifications' },
  { value: 'pending', label: 'Pending review' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' }
];

const SUSPENDED_OPTIONS: readonly Option<SuspendedFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'true', label: 'Suspended' },
  { value: 'false', label: 'Not suspended' }
];

/** Search/filter list of users; the filter state lives in the URL query string. */
@Component({
  selector: 'app-users',
  imports: [DatePipe, RouterLink, StatusChipComponent, PagerComponent, HlmSkeleton, SearchSelectComponent],
  templateUrl: './users.html'
})
export class UsersPage {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly verificationOptions = VERIFICATION_OPTIONS;
  protected readonly suspendedOptions = SUSPENDED_OPTIONS;

  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  protected readonly search = computed(() => this.params().get('q') ?? '');
  protected readonly verification = computed<UserVerificationFilter>(() => {
    const raw = this.params().get('verification');
    return VERIFICATION_FILTERS.find((v) => v === raw) ?? 'all';
  });
  protected readonly suspended = computed<SuspendedFilter>(() => {
    const raw = this.params().get('suspended');
    return SUSPENDED_FILTERS.find((v) => v === raw) ?? 'all';
  });
  protected readonly page = computed(() => {
    const parsed = Number(this.params().get('page'));
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
  });

  private readonly query = computed<UserSearchParams>(() => ({
    q: this.search() || undefined,
    verification: this.verification(),
    suspended: this.suspended() === 'all' ? undefined : this.suspended() === 'true',
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
        this.api.searchUsers(q).pipe(
          catchError(() => {
            this.failed.set(true);
            return of<PageResponse<AdminUserSummary> | null>(null);
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
  protected readonly searchDraft = signal<string | null>(null);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearSearchTimer());
    // A URL change from elsewhere (back button, dashboard link) supersedes any unsent draft.
    toObservable(this.search)
      .pipe(map(() => null), takeUntilDestroyed())
      .subscribe((v) => this.searchDraft.set(v));
  }

  protected verificationChip = verificationChip;

  protected isSuspended(user: AdminUserSummary): boolean {
    return !!user.suspendedUntil && new Date(user.suspendedUntil).getTime() > Date.now();
  }

  protected onSearch(event: Event): void {
    const value = this.valueOf(event);
    this.searchDraft.set(value);
    this.clearSearchTimer();
    this.searchTimer = setTimeout(() => {
      this.searchTimer = null;
      this.updateFilters({ q: value.trim() });
    }, SEARCH_DEBOUNCE_MS);
  }

  protected onVerification(value: string): void {
    this.updateFilters({ verification: value });
  }

  protected onSuspended(value: string): void {
    this.updateFilters({ suspended: value });
  }

  protected goToPage(page: number): void {
    this.navigate({ page });
  }

  /** Any filter change returns to the first page; defaults are dropped from the URL. */
  private updateFilters(changes: Record<string, string>): void {
    const normalised: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(changes)) {
      normalised[key] = value === '' || ((key === 'verification' || key === 'suspended') && value === 'all') ? null : value;
    }
    this.navigate({ ...normalised, page: 0 });
  }

  private navigate(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  private valueOf(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  private clearSearchTimer(): void {
    if (this.searchTimer !== null) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
  }
}

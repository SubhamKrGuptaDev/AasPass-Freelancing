import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ChipStatus, StatusChipComponent } from '../../components/status-chip/status-chip';
import { PagerComponent } from '../../components/pager/pager';
import { AdminStoreSummary, PageResponse, StoreSearchParams, StoreStatusFilter } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { GeoService } from '../../services/geo/geo.service';
import { HlmSkeleton } from '../../ui/skeleton/src';

const PAGE_SIZE = 20;
const NAME_DEBOUNCE_MS = 300;
const STATUS_FILTERS: readonly StoreStatusFilter[] = ['all', 'active', 'inactive', 'blocked', 'unreviewed'];

interface StatusOption {
  value: StoreStatusFilter;
  label: string;
}

const STATUS_OPTIONS: readonly StatusOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'unreviewed', label: 'Unreviewed' }
];

/** Search/filter list of stores; the filter state lives in the URL query string. */
@Component({
  selector: 'app-stores',
  imports: [DatePipe, RouterLink, StatusChipComponent, PagerComponent, HlmSkeleton],
  templateUrl: './stores.html'
})
export class StoresPage {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly geo = inject(GeoService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly countries = this.geo.countries;
  protected readonly statusOptions = STATUS_OPTIONS;

  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  protected readonly country = computed(() => this.params().get('country') ?? '');
  protected readonly city = computed(() => this.params().get('city') ?? '');
  protected readonly nameFilter = computed(() => this.params().get('name') ?? '');
  protected readonly status = computed<StoreStatusFilter>(() => {
    const raw = this.params().get('status');
    return STATUS_FILTERS.find((s) => s === raw) ?? 'all';
  });
  protected readonly page = computed(() => {
    const parsed = Number(this.params().get('page'));
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
  });

  /** Cities of the chosen country, plus the URL's city when it is not in that list (so the select still shows it). */
  protected readonly cityOptions = computed(() => {
    const list = this.country() ? this.geo.citiesFor(this.country())() : [];
    const current = this.city();
    return current && !list.includes(current) ? [current, ...list] : list;
  });

  private readonly query = computed<StoreSearchParams>(() => ({
    country: this.country() || undefined,
    city: this.city() || undefined,
    name: this.nameFilter() || undefined,
    status: this.status(),
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
        this.api.searchStores(q).pipe(
          catchError(() => {
            this.failed.set(true);
            return of<PageResponse<AdminStoreSummary> | null>(null);
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

  /** Text typed in the name box, kept apart from the URL until the debounce fires. */
  protected readonly nameDraft = signal<string | null>(null);
  private nameTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearNameTimer());
    // A URL change from elsewhere (back button, dashboard link) supersedes any unsent draft.
    toObservable(this.nameFilter)
      .pipe(map(() => null), takeUntilDestroyed())
      .subscribe((v) => this.nameDraft.set(v));
  }

  protected chipFor(store: AdminStoreSummary): ChipStatus {
    if (store.adminBlocked) {
      return 'blocked';
    }
    return store.isActive ? 'active' : 'inactive';
  }

  protected onCountry(event: Event): void {
    this.updateFilters({ country: this.valueOf(event), city: '' });
  }

  protected onCity(event: Event): void {
    this.updateFilters({ city: this.valueOf(event) });
  }

  protected onStatus(event: Event): void {
    this.updateFilters({ status: this.valueOf(event) });
  }

  protected onName(event: Event): void {
    const value = this.valueOf(event);
    this.nameDraft.set(value);
    this.clearNameTimer();
    this.nameTimer = setTimeout(() => {
      this.nameTimer = null;
      this.updateFilters({ name: value.trim() });
    }, NAME_DEBOUNCE_MS);
  }

  protected goToPage(page: number): void {
    this.navigate({ page });
  }

  /** Any filter change returns to the first page. */
  private updateFilters(changes: Record<string, string>): void {
    const normalised: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(changes)) {
      normalised[key] = value === '' || (key === 'status' && value === 'all') ? null : value;
    }
    this.navigate({ ...normalised, page: 0 });
  }

  private navigate(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  private valueOf(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  private clearNameTimer(): void {
    if (this.nameTimer !== null) {
      clearTimeout(this.nameTimer);
      this.nameTimer = null;
    }
  }
}

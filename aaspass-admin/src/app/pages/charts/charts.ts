import { Component, LOCALE_ID, computed, inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, scan, startWith, switchMap } from 'rxjs';
import { BarListComponent, BarListItem } from '../../components/bar-list/bar-list';
import { ChartSeries, ColumnChartComponent } from '../../components/column-chart/column-chart';
import { ActivityPeriod, ChartsParams, ChartsResponse, CityCount } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { GeoService } from '../../services/geo/geo.service';
import { HlmSkeleton } from '../../ui/skeleton/src';
import { SearchSelectComponent, SearchSelectOption } from '../../components/search-select/search-select';

/** Categorical slots 1 and 2 of the validated chart palette; light/dark values live in styles.css. */
const SERIES_1 = 'var(--chart-series-1)';
const SERIES_2 = 'var(--chart-series-2)';

interface PeriodOption {
  value: ActivityPeriod;
  /** Lower-case form kept in the URL. */
  param: string;
  label: string;
  range: string;
  tick: string;
  full: string;
}

const PERIODS: readonly PeriodOption[] = [
  { value: 'DAILY', param: 'daily', label: 'Daily', range: 'last 30 days', tick: 'd MMM', full: 'EEE, d MMM y' },
  { value: 'WEEKLY', param: 'weekly', label: 'Weekly', range: 'last 12 weeks', tick: 'd MMM', full: "'Week of' d MMM y" },
  { value: 'MONTHLY', param: 'monthly', label: 'Monthly', range: 'last 12 months', tick: 'MMM yy', full: 'MMMM y' }
];

type LoadEvent = { kind: 'loading' } | { kind: 'ok'; data: ChartsResponse } | { kind: 'error' };

interface ChartsState {
  data: ChartsResponse | null;
  loading: boolean;
  error: boolean;
}

/** Parses an ISO `yyyy-MM-dd` bucket as a local date (no UTC shift). */
function localDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

function sum(values: readonly number[] | undefined): number {
  return (values ?? []).reduce((a, b) => a + b, 0);
}

function cityItems(cities: readonly CityCount[] | undefined): BarListItem[] {
  // Rows saved before the country column existed have no country; say so rather than show a bare duplicate city.
  return (cities ?? []).map((c) => ({ label: c.city, detail: c.country || 'country not set', value: c.count }));
}

/**
 * Trends for sign-ups, new stores and admin verification work, bucketed daily, weekly or monthly
 * and optionally narrowed to a country/city. Filters live in the URL so a view can be shared.
 */
@Component({
  selector: 'app-charts',
  imports: [ColumnChartComponent, BarListComponent, HlmSkeleton, SearchSelectComponent],
  templateUrl: './charts.html'
})
export class ChartsPage {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly geo = inject(GeoService);
  private readonly locale = inject(LOCALE_ID);

  protected readonly periodOptions: readonly SearchSelectOption[] = PERIODS.map((p) => ({ value: p.param, label: `${p.label} (${p.range})` }));
  protected readonly series1 = SERIES_1;

  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  protected readonly period = computed<PeriodOption>(
    () => PERIODS.find((p) => p.param === this.params().get('period')) ?? PERIODS[0]
  );
  protected readonly country = computed(() => this.params().get('country') ?? '');
  protected readonly city = computed(() => this.params().get('city') ?? '');

  /** Cities of the chosen country, plus the URL's city when it is not in that list (so the select still shows it). */
  protected readonly cityOptions = computed(() => {
    const list = this.country() ? this.geo.citiesFor(this.country())() : [];
    const current = this.city();
    return current && !list.includes(current) ? [current, ...list] : list;
  });

  protected readonly countryOptions: readonly SearchSelectOption[] = [
    { value: '', label: 'All countries' },
    ...this.geo.countries.map((c) => ({ value: c.name, label: c.name }))
  ];
  protected readonly citySelectOptions = computed<readonly SearchSelectOption[]>(() => [
    { value: '', label: 'All cities' },
    ...this.cityOptions().map((c) => ({ value: c, label: c }))
  ]);

  private readonly query = computed<ChartsParams>(() => ({
    period: this.period().value,
    country: this.country() || undefined,
    city: this.city() || undefined
  }));

  /** Keeps the previous charts on screen (dimmed) while a new filter loads. */
  protected readonly state = toSignal(
    toObservable(this.query).pipe(
      switchMap((q) =>
        this.api.charts(q).pipe(
          map((data): LoadEvent => ({ kind: 'ok', data })),
          catchError(() => of<LoadEvent>({ kind: 'error' })),
          startWith<LoadEvent>({ kind: 'loading' })
        )
      ),
      scan<LoadEvent, ChartsState>(
        (acc, event) =>
          event.kind === 'loading' ? { ...acc, loading: true, error: false }
          : event.kind === 'ok' ? { data: event.data, loading: false, error: false }
          : { ...acc, loading: false, error: true },
        { data: null, loading: true, error: false }
      )
    ),
    { initialValue: { data: null, loading: true, error: false } as ChartsState }
  );

  protected readonly ticks = computed(() => {
    const fmt = this.period().tick;
    return (this.state().data?.buckets ?? []).map((b) => formatDate(localDate(b), fmt, this.locale));
  });

  protected readonly labels = computed(() => {
    const fmt = this.period().full;
    return (this.state().data?.buckets ?? []).map((b) => formatDate(localDate(b), fmt, this.locale));
  });

  protected readonly newUsers = computed<ChartSeries[]>(() => [
    { name: 'New users', color: SERIES_1, values: this.state().data?.newUsers ?? [] }
  ]);
  protected readonly newStores = computed<ChartSeries[]>(() => [
    { name: 'New stores', color: SERIES_1, values: this.state().data?.newStores ?? [] }
  ]);
  protected readonly userDecisions = computed<ChartSeries[]>(() => [
    { name: 'Verified', color: SERIES_1, values: this.state().data?.userItemsVerified ?? [] },
    { name: 'Rejected', color: SERIES_2, values: this.state().data?.userItemsRejected ?? [] }
  ]);
  protected readonly storesReviewed = computed<ChartSeries[]>(() => [
    { name: 'Stores reviewed', color: SERIES_1, values: this.state().data?.storesReviewed ?? [] }
  ]);

  protected readonly totals = computed(() => {
    const d = this.state().data;
    return {
      newUsers: sum(d?.newUsers),
      newStores: sum(d?.newStores),
      verified: sum(d?.userItemsVerified),
      rejected: sum(d?.userItemsRejected),
      reviewed: sum(d?.storesReviewed)
    };
  });

  protected readonly topUserCities = computed(() => cityItems(this.state().data?.topUserCities));
  protected readonly topStoreCities = computed(() => cityItems(this.state().data?.topStoreCities));

  /** Where the numbers come from, e.g. "last 30 days in Pune, India". */
  protected readonly scope = computed(() => {
    const place = [this.city(), this.country()].filter(Boolean).join(', ');
    return place ? `${this.period().range} in ${place}` : this.period().range;
  });

  protected readonly skeletonSlots = [1, 2, 3, 4];

  protected onPeriod(value: string): void {
    const match = PERIODS.find((p) => p.param === value);
    if (match) {
      this.updateFilters({ period: match.param === 'daily' ? null : match.param });
    }
  }

  protected onCountry(value: string): void {
    this.updateFilters({ country: value || null, city: null });
  }

  protected onCity(value: string): void {
    this.updateFilters({ city: value || null });
  }

  private updateFilters(changes: Record<string, string | null>): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: changes, queryParamsHandling: 'merge' });
  }
}

import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { ChartSeries, ColumnChartComponent } from '../../../components/column-chart/column-chart';
import {
  AbandonedAttempt,
  AnalyticsPeriod,
  Booking,
  BookingAnalytics,
  BookingStatus,
  FunnelStepKey,
  OwnerBookingRow
} from '../../../models/booking.model';
import { StoreService } from '../../../services/store/store.service';
import { PageResponse } from '../../../models/response.model';
import { OwnerBookingHttpService } from '../../../services/booking';
import { formatDuration, parseIsoDate, timeAgo } from '../../../utils/booking-time';
import { BookingDecisionPanelComponent } from '../booking-decision-panel/booking-decision-panel';
import { OwnerStoreSwitcherComponent } from '../owner-store-switcher';

interface InboxTab {
  key: string;
  label: string;
  statuses: BookingStatus[];
}

const TABS: readonly InboxTab[] = [
  { key: 'pending', label: 'Pending', statuses: ['PENDING'] },
  { key: 'confirmed', label: 'Confirmed', statuses: ['CONFIRMED'] },
  { key: 'completed', label: 'Completed', statuses: ['COMPLETED'] },
  { key: 'closed', label: 'Rejected & Cancelled', statuses: ['REJECTED', 'CANCELLED'] }
];

const PAGE_SIZE = 20;

const PERIODS: readonly { key: AnalyticsPeriod; label: string }[] = [
  { key: '7D', label: '7D' },
  { key: '30D', label: '30D' },
  { key: 'ALL', label: 'All' }
];

const FUNNEL_LABELS: Record<FunnelStepKey, string> = {
  BOOK_CLICK: 'Book clicks',
  BOOKING_PAGE_VIEW: 'Booking page views',
  SLOT_SELECTED: 'Slot selected',
  BOOKED: 'Booking requests'
};

const STEP_LABELS: Record<FunnelStepKey, string> = {
  BOOK_CLICK: 'Clicked Book',
  BOOKING_PAGE_VIEW: 'Opened booking page',
  SLOT_SELECTED: 'Picked a slot',
  BOOKED: 'Requested'
};

const ABANDONED_PAGE_SIZE = 10;

interface Kpi {
  key: string;
  label: string;
  value: number;
  /** Already formatted, e.g. "50%". */
  percent: string;
  percentNote: string;
}

/** Formats 50 -> "50%", 33.333 -> "33.3%"; non-finite values read as 0%. */
function pct(v: number | null | undefined): string {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(v) ? (v as number) : 0));
  return `${+clamped.toFixed(1)}%`;
}

/** Owner dashboard home: booking analytics (funnel, trend, per-service, abandoned) above the inbox. */
@Component({
  selector: 'app-owner-dashboard',
  imports: [RouterLink, HlmBadgeImports, HlmButtonImports, OwnerStoreSwitcherComponent, BookingDecisionPanelComponent, ColumnChartComponent],
  templateUrl: './owner-dashboard.html'
})
export class OwnerDashboardComponent {
  private readonly http = inject(OwnerBookingHttpService);
  private readonly storeService = inject(StoreService);

  protected readonly tabs = TABS;
  protected readonly formatDuration = formatDuration;

  readonly storeId = signal<string | undefined>(undefined);
  readonly tab = signal<string>('pending');
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly rows = signal<OwnerBookingRow[]>([]);
  readonly state = signal<'idle' | 'loading' | 'loaded' | 'failed'>('idle');

  /** Competing requests per booking id once expanded ('loading' while fetching). */
  protected readonly overlaps = signal<Record<number, Booking[] | 'loading'>>({});
  protected readonly expanded = signal<ReadonlySet<number>>(new Set());

  protected readonly periods = PERIODS;
  protected readonly timeAgo = timeAgo;
  protected readonly stepLabel = (s: FunnelStepKey): string => STEP_LABELS[s] ?? s;

  readonly period = signal<AnalyticsPeriod>('7D');
  readonly analytics = signal<BookingAnalytics | null>(null);
  readonly analyticsState = signal<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  readonly abandoned = signal<AbandonedAttempt[]>([]);
  readonly abandonedPage = signal(0);
  readonly abandonedTotalPages = signal(0);
  readonly abandonedFailed = signal(false);

  protected readonly bookingsClosed = computed(() => {
    const id = this.storeId();
    const store = (this.storeService.userStores() ?? []).find(s => String(s.id) === id);
    return !!store && !store.bookingsOpen;
  });

  protected readonly funnel = computed(() => {
    const steps = this.analytics()?.funnel ?? [];
    const top = Math.max(1, ...steps.map(s => s.visitors ?? 0));
    return steps.map((s, i) => {
      const visitors = s.visitors ?? 0;
      return {
        step: s.step,
        label: FUNNEL_LABELS[s.step] ?? s.step,
        visitors,
        widthPercent: Math.max((visitors / top) * 100, visitors > 0 ? 2 : 0),
        dropOff: i === 0 ? null : pct(100 - (s.conversionPercent ?? 0))
      };
    });
  });

  protected readonly hasActivity = computed(() => {
    const a = this.analytics();
    return !!a && ((a.funnel ?? []).some(s => (s.visitors ?? 0) > 0) || (a.abandonedCount ?? 0) > 0);
  });

  protected readonly kpis = computed<Kpi[]>(() => {
    const a = this.analytics();
    if (!a) return [];
    const funnel = a.funnel ?? [];
    const kpis: Kpi[] = funnel.map((s, i) => ({
      key: s.step,
      label: FUNNEL_LABELS[s.step] ?? s.step,
      value: s.visitors ?? 0,
      percent: pct(i === 0 ? 100 : s.conversionPercent),
      percentNote: i === 0 ? 'of visitors' : 'of previous'
    }));
    const booked = funnel.find(s => s.step === 'BOOKED')?.visitors ?? 0;
    kpis.push({
      key: 'CONFIRMED',
      label: 'Confirmed',
      value: a.confirmed ?? 0,
      percent: pct(booked > 0 ? ((a.confirmed ?? 0) / booked) * 100 : 0),
      percentNote: 'of requests'
    });
    kpis.push({
      key: 'ABANDONED',
      label: 'Abandoned',
      value: a.abandonedCount ?? 0,
      percent: pct(a.abandonedPercent),
      percentNote: 'of attempts'
    });
    return kpis;
  });

  protected readonly trendTicks = computed(() => (this.analytics()?.buckets ?? []).map(b => this.dayLabel(b, false)));
  protected readonly trendLabels = computed(() => (this.analytics()?.buckets ?? []).map(b => this.dayLabel(b, true)));
  protected readonly trendSeries = computed<ChartSeries[]>(() => {
    const a = this.analytics();
    return [
      { name: 'Clicks', color: 'var(--chart-series-1)', values: a?.clicks ?? [] },
      { name: 'Bookings', color: 'var(--chart-series-2)', values: a?.bookings ?? [] },
      { name: 'Abandoned', color: 'var(--chart-series-3)', values: a?.abandoned ?? [] }
    ];
  });

  private analyticsSeq = 0;
  private abandonedSeq = 0;

  private readonly activeTab = computed(() => TABS.find(t => t.key === this.tab()) ?? TABS[0]);
  private requestSeq = 0;

  constructor() {
    effect(() => {
      const id = this.storeId();
      const period = this.period();
      if (id) {
        this.loadAnalytics(id, period);
        this.loadAbandoned(id, period, 0);
      }
    });
    effect(() => {
      const id = this.storeId();
      if (id) {
        this.tab(); // reload when the tab changes
        this.load(id, 0);
      }
    });
  }

  protected selectPeriod(p: AnalyticsPeriod): void {
    if (p !== this.period()) {
      this.period.set(p);
    }
  }

  protected reloadAnalytics(): void {
    const id = this.storeId();
    if (id) {
      this.loadAnalytics(id, this.period());
    }
  }

  protected retryAbandoned(): void {
    const id = this.storeId();
    if (id) {
      this.loadAbandoned(id, this.period(), this.abandonedPage());
    }
  }

  protected gotoAbandoned(page: number): void {
    const id = this.storeId();
    if (id && page >= 0 && page < this.abandonedTotalPages()) {
      this.loadAbandoned(id, this.period(), page);
    }
  }

  private loadAnalytics(storeId: string, period: AnalyticsPeriod): void {
    const seq = ++this.analyticsSeq;
    this.analyticsState.set('loading');
    this.http.analytics(storeId, period).subscribe({
      next: a => {
        if (seq !== this.analyticsSeq) return;
        this.analytics.set(a);
        this.analyticsState.set('loaded');
      },
      error: () => {
        if (seq !== this.analyticsSeq) return;
        this.analyticsState.set('failed');
      }
    });
  }

  private loadAbandoned(storeId: string, period: AnalyticsPeriod, page: number): void {
    const seq = ++this.abandonedSeq;
    this.abandonedFailed.set(false);
    this.http.abandoned(storeId, period, page, ABANDONED_PAGE_SIZE).subscribe({
      next: p => {
        if (seq !== this.abandonedSeq) return;
        this.abandonedFailed.set(false);
        this.abandoned.set(p?.content ?? []);
        this.abandonedPage.set(page);
        this.abandonedTotalPages.set(p?.totalPages ?? 0);
      },
      error: () => {
        if (seq !== this.abandonedSeq) return;
        this.abandonedFailed.set(true);
        this.abandoned.set([]);
        this.abandonedTotalPages.set(0);
      }
    });
  }

  private dayLabel(iso: string, long: boolean): string {
    const d = parseIsoDate(iso);
    if (!d) return iso;
    return long
      ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  protected initial(name: string | null | undefined): string {
    return (name ?? '?').trim().charAt(0).toUpperCase() || '?';
  }

  protected selectTab(key: string): void {
    if (key !== this.tab()) {
      this.tab.set(key);
    }
  }

  protected reload(): void {
    const id = this.storeId();
    if (id) {
      this.load(id, this.page());
    }
  }

  protected goto(page: number): void {
    const id = this.storeId();
    if (id && page >= 0 && page < this.totalPages()) {
      this.load(id, page);
    }
  }

  private load(storeId: string, page: number): void {
    const seq = ++this.requestSeq;
    const statuses = this.activeTab().statuses;
    this.state.set('loading');
    forkJoin(statuses.map(s => this.http.list(storeId, s, page, PAGE_SIZE)))
      .pipe(map(pages => this.merge(pages, statuses.length > 1)))
      .subscribe({
        next: merged => {
          if (seq !== this.requestSeq) return;
          // Acting on the last row of the last page leaves it empty: step back to the last real page.
          if (merged.rows.length === 0 && page > 0) {
            this.load(storeId, Math.max(0, Math.min(page - 1, merged.totalPages - 1)));
            return;
          }
          this.rows.set(merged.rows);
          this.page.set(page);
          this.totalPages.set(merged.totalPages);
          this.expanded.set(new Set());
          this.overlaps.set({});
          this.state.set('loaded');
        },
        error: () => {
          if (seq !== this.requestSeq) return;
          this.state.set('failed');
        }
      });
  }

  /** The backend filters by one status, so a multi-status tab merges its pages newest first. */
  private merge(pages: PageResponse<OwnerBookingRow>[], sort: boolean): { rows: OwnerBookingRow[]; totalPages: number } {
    const rows = pages.flatMap(p => p?.content ?? []);
    if (sort) {
      rows.sort((a, b) => (b.booking?.startAt ?? '').localeCompare(a.booking?.startAt ?? ''));
    }
    return { rows, totalPages: Math.max(0, ...pages.map(p => p?.totalPages ?? 0)) };
  }

  protected overlapTotal(row: OwnerBookingRow): number {
    return (row.overlapPendingCount ?? 0) + (row.overlapConfirmedCount ?? 0);
  }

  protected toggleOverlaps(row: OwnerBookingRow): void {
    const id = row.booking.id;
    const open = new Set(this.expanded());
    if (open.has(id)) {
      open.delete(id);
      this.expanded.set(open);
      return;
    }
    open.add(id);
    this.expanded.set(open);
    this.overlaps.update(m => ({ ...m, [id]: 'loading' }));
    this.http.overlaps(row.booking.storeId, id).subscribe({
      next: list => this.overlaps.update(m => ({ ...m, [id]: list ?? [] })),
      error: () => this.overlaps.update(m => ({ ...m, [id]: [] }))
    });
  }

  protected competitors(id: number): Booking[] {
    const v = this.overlaps()[id];
    return Array.isArray(v) ? v : [];
  }

  protected competitorsLoading(id: number): boolean {
    return this.overlaps()[id] === 'loading';
  }

  protected when(b: Booking): string {
    return b.startAt.replace('T', ' ').slice(0, 16);
  }
}

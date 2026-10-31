import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Booking, BookingStatus, OwnerBookingRow } from '../../../models/booking.model';
import { PageResponse } from '../../../models/response.model';
import { OwnerBookingHttpService } from '../../../services/booking';
import { formatDuration } from '../../../utils/booking-time';
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

/** Owner dashboard home. Analytics sections are added above the inbox in a later task. */
@Component({
  selector: 'app-owner-dashboard',
  imports: [RouterLink, HlmBadgeImports, HlmButtonImports, OwnerStoreSwitcherComponent, BookingDecisionPanelComponent],
  templateUrl: './owner-dashboard.html'
})
export class OwnerDashboardComponent {
  private readonly http = inject(OwnerBookingHttpService);

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

  private readonly activeTab = computed(() => TABS.find(t => t.key === this.tab()) ?? TABS[0]);
  private requestSeq = 0;

  constructor() {
    effect(() => {
      const id = this.storeId();
      if (id) {
        this.tab(); // reload when the tab changes
        this.load(id, 0);
      }
    });
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

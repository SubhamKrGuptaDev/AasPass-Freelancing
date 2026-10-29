import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, startWith, switchMap } from 'rxjs';
import { StatusChipComponent } from '../../components/status-chip/status-chip';
import { ActivityPeriod, DashboardResponse, NewActivityResponse } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { storeChip } from '../stores/stores';
import { HlmSkeleton } from '../../ui/skeleton/src';

interface PeriodOption {
  value: ActivityPeriod;
  label: string;
}

const PERIOD_OPTIONS: readonly PeriodOption[] = [
  { value: 'DAILY', label: 'Daily (last 24 hours)' },
  { value: 'WEEKLY', label: 'Weekly (last 7 days)' },
  { value: 'MONTHLY', label: 'Monthly (last 30 days)' }
];

interface StatCard {
  label: string;
  value: number;
}

/** Moderation overview: headline counts, items waiting for an admin, and the newest users and stores. */
@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink, StatusChipComponent, HlmSkeleton],
  templateUrl: './dashboard.html'
})
export class DashboardPage {
  private readonly api = inject(AdminApiService);

  /** `undefined` while loading, `null` when the request failed (the error toast explains why). */
  protected readonly data = toSignal(
    this.api.dashboard().pipe(catchError(() => of<DashboardResponse | null>(null))),
    { initialValue: undefined }
  );

  protected readonly cards = computed<StatCard[]>(() => {
    const d = this.data();
    if (!d) {
      return [];
    }
    return [
      { label: 'Users', value: d.totalUsers },
      { label: 'Stores', value: d.totalStores },
      { label: 'Pending verifications', value: d.pendingUsers },
      { label: 'Unreviewed stores', value: d.unreviewedStores },
      { label: 'Blocked stores', value: d.blockedStores },
      { label: 'Suspended users', value: d.suspendedUsers }
    ];
  });

  protected readonly periodOptions = PERIOD_OPTIONS;
  protected readonly period = signal<ActivityPeriod>('DAILY');

  /** Reloads on every period change; `undefined` while loading, `null` on failure. */
  protected readonly activity = toSignal(
    toObservable(this.period).pipe(
      switchMap((period) =>
        this.api.newActivity(period).pipe(
          startWith(undefined),
          catchError(() => of<NewActivityResponse | null>(null))
        )
      )
    ),
    { initialValue: undefined }
  );

  protected readonly chipFor = storeChip;

  protected onPeriod(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value;
    const match = PERIOD_OPTIONS.find((o) => o.value === value);
    if (match) {
      this.period.set(match.value);
    }
  }

  protected readonly skeletonSlots = [1, 2, 3, 4, 5, 6];
  protected readonly skeletonRows = [1, 2, 3];
}

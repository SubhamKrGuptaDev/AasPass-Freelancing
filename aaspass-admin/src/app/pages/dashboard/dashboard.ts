import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { StatusChipComponent } from '../../components/status-chip/status-chip';
import { DashboardResponse } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { HlmSkeleton } from '../../ui/skeleton/src';

interface StatCard {
  label: string;
  value: number;
}

/** Moderation overview: headline counts plus the oldest items waiting for an admin. */
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

  protected readonly skeletonSlots = [1, 2, 3, 4, 5, 6];
  protected readonly skeletonRows = [1, 2, 3];
}

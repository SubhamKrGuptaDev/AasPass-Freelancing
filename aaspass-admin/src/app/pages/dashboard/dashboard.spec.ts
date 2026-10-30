import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { ActivityPeriod, AdminStoreSummary, AdminUserSummary, DashboardResponse, NewActivityResponse } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { DashboardPage } from './dashboard';
import { pickSearchSelect, searchSelect } from '../../components/search-select/search-select.testing';

const user: AdminUserSummary = {
  id: 7, name: 'Asha Rao', username: 'asha', email: 'asha@x.in', city: 'Pune', country: 'India',
  phoneStatus: 'UNVERIFIED', panStatus: 'UNVERIFIED', aadharStatus: 'UNVERIFIED',
  suspendedUntil: null, storeCount: 1, creationDateTime: '2026-10-01T10:00:00'
};
const store: AdminStoreSummary = {
  id: 3, storeName: 'Chai Corner', category: 'Food', ownerId: 7, ownerName: 'Asha Rao', ownerUsername: 'asha',
  city: 'Pune', country: 'India', area: 'Kothrud', isActive: true, adminBlocked: false, reviewed: false,
  creationDateTime: '2026-10-02T10:00:00'
};
const data: DashboardResponse = {
  totalUsers: 120, totalStores: 45, activeStores: 40, pendingUsers: 6, unreviewedStores: 4, newContactRequests: 0,
  blockedStores: 2, suspendedUsers: 1, recentPendingUsers: [user], recentUnreviewedStores: [store]
};
const activity: NewActivityResponse = {
  period: 'DAILY', newUsers: 1, newStores: 1, recentUsers: [user], recentStores: [store]
};

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let el: HTMLElement;

  let newActivity: ReturnType<typeof vi.fn<(period: ActivityPeriod) => Observable<NewActivityResponse>>>;

  const setup = (response: DashboardResponse | null, activityResponse: NewActivityResponse = activity) => {
    const dashboard$ = response ? of(response) : new Subject<DashboardResponse>();
    newActivity = vi.fn((period: ActivityPeriod) => of({ ...activityResponse, period }));
    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideRouter([]), { provide: AdminApiService, useValue: { dashboard: () => dashboard$, newActivity } }]
    });
    fixture = TestBed.createComponent(DashboardPage);
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  };

  it('rendersCountsFromApi', () => {
    setup(data);
    const text = el.textContent ?? '';
    for (const label of ['Users', 'Stores', 'Pending verifications', 'Unreviewed stores', 'Blocked stores', 'Suspended users']) {
      expect(text).toContain(label);
    }
    expect(el.querySelector('[data-testid="stat-Users"]')?.textContent).toContain('120');
    expect(el.querySelector('[data-testid="stat-Pending verifications"]')?.textContent).toContain('6');
    expect(el.querySelector('[data-testid="stat-Blocked stores"]')?.textContent).toContain('2');
  });

  it('listsRecentRowsWithViewAllLinks', () => {
    setup(data);
    expect(el.textContent).toContain('Asha Rao');
    expect(el.textContent).toContain('Chai Corner');
    const hrefs = Array.from(el.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/users?verification=pending');
    expect(hrefs).toContain('/stores?status=unreviewed');
  });

  it('showsEmptyStateWhenNothingWaiting', () => {
    setup({ ...data, recentPendingUsers: [], recentUnreviewedStores: [] });
    expect(el.textContent?.match(/Nothing waiting — all caught up\./g)?.length).toBe(2);
  });

  it('showsNewUsersAndNewStoresForDailyByDefault', () => {
    const newUser: AdminUserSummary = { ...user, id: 9, name: 'Vikram Shah', email: 'vikram@x.in' };
    const blockedStore: AdminStoreSummary = { ...store, id: 5, storeName: 'Book Nook', adminBlocked: true, reviewed: true };
    setup(data, { ...activity, newUsers: 4, newStores: 2, recentUsers: [newUser], recentStores: [blockedStore] });
    expect(newActivity).toHaveBeenCalledWith('DAILY');
    expect(searchSelect(fixture, 'activity-period').selected()).toBe('DAILY');
    expect(el.querySelector<HTMLInputElement>('input#activity-period')?.value).toBe('Daily (last 24 hours)');
    const users = el.querySelector('[aria-labelledby="new-users-heading"]');
    const stores = el.querySelector('[aria-labelledby="new-stores-heading"]');
    expect(users?.textContent).toContain('New users joined (4)');
    expect(users?.textContent).toContain('Vikram Shah');
    expect(users?.querySelector('a[href="/users/9"]')).not.toBeNull();
    expect(stores?.textContent).toContain('New stores created (2)');
    expect(stores?.textContent).toContain('Book Nook');
    expect(stores?.textContent).toContain('Blocked');
    expect(stores?.textContent).not.toContain('Unreviewed');
    expect(stores?.querySelector('a[href="/stores/5"]')).not.toBeNull();
  });

  it('reloadsNewActivityWhenPeriodChanges', () => {
    setup(data);
    for (const period of ['WEEKLY', 'MONTHLY'] as const) {
      pickSearchSelect(fixture, 'activity-period', period);
      expect(newActivity).toHaveBeenLastCalledWith(period);
    }
    expect(newActivity).toHaveBeenCalledTimes(3);
  });

  it('showsEmptyStateWhenNoNewUsersOrStores', () => {
    setup(data, { ...activity, newUsers: 0, newStores: 0, recentUsers: [], recentStores: [] });
    expect(el.textContent).toContain('No new users in this period.');
    expect(el.textContent).toContain('No new stores in this period.');
  });

  it('showsSkeletonsWhileLoading', () => {
    setup(null);
    expect(el.querySelectorAll('[data-testid="skeleton"]').length).toBeGreaterThan(0);
    expect(el.querySelector('[data-testid="stat-Users"]')).toBeNull();
  });
});

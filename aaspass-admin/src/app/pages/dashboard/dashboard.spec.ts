import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { AdminStoreSummary, AdminUserSummary, DashboardResponse } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { DashboardPage } from './dashboard';

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
  totalUsers: 120, totalStores: 45, activeStores: 40, pendingUsers: 6, unreviewedStores: 4,
  blockedStores: 2, suspendedUsers: 1, recentPendingUsers: [user], recentUnreviewedStores: [store]
};

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let el: HTMLElement;

  const setup = (response: DashboardResponse | null) => {
    const dashboard$ = response ? of(response) : new Subject<DashboardResponse>();
    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideRouter([]), { provide: AdminApiService, useValue: { dashboard: () => dashboard$ } }]
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

  it('showsSkeletonsWhileLoading', () => {
    setup(null);
    expect(el.querySelectorAll('[data-testid="skeleton"]').length).toBeGreaterThan(0);
    expect(el.querySelector('[data-testid="stat-Users"]')).toBeNull();
  });
});

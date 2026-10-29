import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { AdminUserSummary, PageResponse } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { UsersPage } from './users';

const user: AdminUserSummary = {
  id: 9, name: 'Asha Rao', username: 'asha', email: 'a@x.in', city: 'Pune', country: 'India',
  phoneStatus: 'VERIFIED', panStatus: 'REJECTED', aadharStatus: 'UNVERIFIED',
  suspendedUntil: '2027-01-01T10:00:00', storeCount: 1, creationDateTime: '2026-10-01T10:00:00'
};
const pageOf = (content: AdminUserSummary[]): PageResponse<AdminUserSummary> => ({
  content, page: 0, size: 20, totalElements: content.length, totalPages: 2
});

describe('UsersPage', () => {
  let searchUsers: ReturnType<typeof vi.fn>;
  let harness: RouterTestingHarness;
  let el: HTMLElement;

  const setup = async (url: string) => {
    searchUsers = vi.fn().mockReturnValue(of(pageOf([user])));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'users', component: UsersPage }]),
        { provide: AdminApiService, useValue: { searchUsers } }
      ]
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, UsersPage);
    harness.detectChanges();
    el = harness.routeNativeElement as HTMLElement;
  };

  it('mapsVerificationQueryParamIntoRequest', async () => {
    await setup('/users?verification=pending');
    expect(searchUsers).toHaveBeenCalledWith(expect.objectContaining({ verification: 'pending' }));
    expect(el.querySelector<HTMLSelectElement>('#filter-verification')!.value).toBe('pending');
  });

  it('mapsSuspendedQueryParamToBoolean', async () => {
    await setup('/users?suspended=true');
    expect(searchUsers).toHaveBeenCalledWith(expect.objectContaining({ suspended: true }));
    await setup('/users?suspended=false');
    expect(searchUsers).toHaveBeenLastCalledWith(expect.objectContaining({ suspended: false }));
  });

  it('omitsSuspendedWhenAll', async () => {
    await setup('/users');
    expect(searchUsers.mock.calls[0][0].suspended).toBeUndefined();
  });

  it('rendersRowsWithStatusText', async () => {
    await setup('/users');
    expect(el.querySelector('a[href="/users/9"]')?.textContent).toContain('Asha Rao');
    const text = el.textContent ?? '';
    expect(text).toContain('Verified');
    expect(text).toContain('Rejected');
    expect(text).toContain('Unverified');
    expect(text).toContain('Suspended');
  });

  it('updatesUrlAndResetsPageWhenVerificationChanges', async () => {
    await setup('/users?page=2');
    const select = el.querySelector<HTMLSelectElement>('#filter-verification')!;
    select.value = 'verified';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    harness.detectChanges();
    const router = TestBed.inject(Router);
    const params = router.parseUrl(router.url).queryParams;
    expect(params['verification']).toBe('verified');
    expect(params['page']).toBe('0');
    expect(searchUsers).toHaveBeenLastCalledWith(expect.objectContaining({ verification: 'verified', page: 0 }));
  });
});

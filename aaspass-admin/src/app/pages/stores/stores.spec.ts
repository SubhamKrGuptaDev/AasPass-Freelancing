import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { AdminStoreSummary, PageResponse } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { StoresPage } from './stores';
import { pickSearchSelect } from '../../components/search-select/search-select.testing';

const store: AdminStoreSummary = {
  id: 3, storeName: 'Chai Corner', category: 'Food', ownerId: 7, ownerName: 'Asha Rao', ownerUsername: 'asha',
  city: 'Bengaluru', country: 'India', area: 'Indiranagar', isActive: true, adminBlocked: true, reviewed: true,
  creationDateTime: '2026-10-02T10:00:00'
};
const pageOf = (content: AdminStoreSummary[]): PageResponse<AdminStoreSummary> => ({
  content, page: 0, size: 20, totalElements: content.length, totalPages: 3
});

describe('StoresPage', () => {
  let searchStores: ReturnType<typeof vi.fn>;
  let harness: RouterTestingHarness;
  let el: HTMLElement;

  const setup = async (url: string, rows: AdminStoreSummary[] = [store]) => {
    searchStores = vi.fn().mockReturnValue(of(pageOf(rows)));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'stores', component: StoresPage }]),
        { provide: AdminApiService, useValue: { searchStores } }
      ]
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, StoresPage);
    harness.detectChanges();
    el = harness.routeNativeElement as HTMLElement;
  };

  it('readsQueryParamsIntoFormAndSearch', async () => {
    await setup('/stores?city=Bengaluru&status=blocked');
    expect(searchStores).toHaveBeenCalledWith(expect.objectContaining({ city: 'Bengaluru', status: 'blocked' }));
    expect(el.querySelector<HTMLInputElement>('input#filter-status')!.value).toBe('Blocked');
    expect(el.querySelector<HTMLInputElement>('input#filter-city')!.value).toBe('Bengaluru');
  });

  it('rendersOwnerlessStoreWithoutNullText', async () => {
    await setup('/stores', [{ ...store, ownerId: null, ownerName: null, ownerUsername: null }]);
    const row = el.querySelector('tbody tr')!;
    expect(row.textContent).toContain('No owner');
    expect(row.textContent).not.toContain('null');
  });

  it('updatesUrlAndResetsPageWhenStatusChanges', async () => {
    await setup('/stores?status=blocked&page=2');
    pickSearchSelect(harness.fixture, 'filter-status', 'active');
    await harness.fixture.whenStable();
    harness.detectChanges();
    const router = TestBed.inject(Router);
    const params = router.parseUrl(router.url).queryParams;
    expect(params['status']).toBe('active');
    expect(params['page']).toBe('0');
    expect(searchStores).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'active', page: 0 }));
  });

  it('disablesCityUntilCountryChosen', async () => {
    await setup('/stores');
    expect(el.querySelector<HTMLInputElement>('input#filter-city')!.disabled).toBe(true);
    expect(el.querySelector<HTMLInputElement>('input#filter-country')?.value).toBe('All countries');
  });

  it('rendersRowsWithStatusTextAndDetailLink', async () => {
    await setup('/stores');
    expect(el.textContent).toContain('Chai Corner');
    expect(el.textContent).toContain('Blocked');
    expect(el.querySelector('a[href="/stores/3"]')).not.toBeNull();
    expect(el.textContent).toContain('Page 1 of 3');
  });
});

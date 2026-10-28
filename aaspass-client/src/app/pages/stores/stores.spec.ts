import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { API_BASE_URL } from '../../config/api.config';
import { BackendStoreResponse } from '../../models/response.model';
import { StoreService } from '../../services/store/store.service';
import { StoreDetailComponent } from '../store-detail/store-detail';
import { StoresComponent } from './stores';

function backendStore(id: number, overrides: Partial<BackendStoreResponse> = {}): BackendStoreResponse {
  return {
    id, userId: 1, ownerName: `Owner ${id}`, storeName: `Store ${id}`, tagline: 'tag', category: 'Photography',
    skills: [], experienceYears: 1, hourlyRate: 100, startingPrice: 100, area: 'Area', city: 'Pune',
    serviceRadiusKm: 5, description: '', rating: 4, reviewCount: 1, isAvailable: true,
    ...overrides
  } as unknown as BackendStoreResponse;
}

describe('StoresComponent', () => {
  let harness: RouterTestingHarness;
  let httpTesting: HttpTestingController;
  let service: StoreService;
  let router: Router;

  async function open(url: string, stores: BackendStoreResponse[] = []): Promise<StoresComponent> {
    const nav = harness.navigateByUrl(url, StoresComponent);
    httpTesting.match(`${API_BASE_URL}/stores`).forEach(r => r.flush({ success: true, message: 'ok', data: stores }));
    const cmp = await nav;
    harness.detectChanges();
    await harness.fixture.whenStable();
    return cmp;
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()]
    });
    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(StoreService);
    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
    // GET /stores fired on StoreService construction stays pending until open() flushes it
  });

  afterEach(() => {
    httpTesting.match(() => true);
  });

  it('applies URL params to StoreService on load', async () => {
    const cmp = await open('/stores?city=pune&category=photography&q=reels&sort=views&open=1');
    expect(service.selectedCity()).toBe('Pune');
    expect(service.selectedCategory()).toBe('Photography');
    expect(service.searchQuery()).toBe('reels');
    expect(cmp.sort()).toBe('views');
    expect(cmp.openOnly()).toBe(true);
    expect(cmp.searchControl.value).toBe('reels');
  });

  it('keeps current city when URL city is unknown', async () => {
    service.setSelectedCity('Mumbai');
    await open('/stores?city=atlantis');
    expect(service.selectedCity()).toBe('Mumbai');
  });

  it('writes filter changes to the URL with replaceUrl', async () => {
    const cmp = await open('/stores?city=Pune');
    const spy = vi.spyOn(router, 'navigate');
    cmp.setCategory('Web & Tech');
    const [commands, extras] = spy.mock.calls[0];
    expect(commands).toEqual([]);
    expect(extras?.queryParams?.['category']).toBe('Web & Tech');
    expect(extras?.queryParams?.['city']).toBe('Pune');
    expect(extras?.replaceUrl).toBe(true);
  });

  it('follows a navbar city change exactly once', async () => {
    await open('/stores?city=Pune');
    const spy = vi.spyOn(router, 'navigate');
    service.setSelectedCity('Delhi NCR');
    TestBed.tick();
    await harness.fixture.whenStable();
    expect(router.url).toContain('city=Delhi%20NCR');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('writes the selected city into the URL when none is present', async () => {
    await open('/stores');
    expect(router.url).toContain(`city=${encodeURIComponent(service.selectedCity())}`);
  });

  it('filters to open stores and sorts results', async () => {
    const cmp = await open('/stores?city=Pune', [
      backendStore(1, { hourlyRate: 300 }),
      backendStore(2, { hourlyRate: 100, isAvailable: false }),
      backendStore(3, { hourlyRate: 200 })
    ]);
    cmp.setOpenOnly(true);
    cmp.setSort('price-asc');
    expect(cmp.results().map(s => s.id)).toEqual(['3', '1']);
    cmp.setOpenOnly(false);
    expect(cmp.results().map(s => s.id)).toEqual(['2', '3', '1']);
  });

  it('/stores renders the list and /stores/store-7 renders detail', async () => {
    await open('/stores?city=Pune', [backendStore(1)]);
    expect(harness.routeNativeElement?.querySelectorAll('app-store-card').length).toBe(1);

    const detailNav = harness.navigateByUrl('/stores/store-7');
    httpTesting.match(() => true).forEach(r => r.flush({ success: true, message: 'ok', data: [] }));
    const detail = await detailNav;
    expect(detail).toBeInstanceOf(StoreDetailComponent);
    httpTesting.match(() => true);
  });

  it('shows empty state with other-city links and reset', async () => {
    const cmp = await open('/stores?city=Pune', []);
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.textContent).toContain('0 stores in Pune');
    const links = Array.from(el.querySelectorAll('a')).map(a => a.getAttribute('href') ?? '');
    expect(links.some(h => h.includes('city=Mumbai'))).toBe(true);
    expect(links.some(h => h.includes('city=Pune'))).toBe(false);

    cmp.setSort('views');
    cmp.setOpenOnly(true);
    cmp.resetFilters();
    expect(cmp.sort()).toBe('rating');
    expect(cmp.openOnly()).toBe(false);
    expect(cmp.searchControl.value).toBe('');
    expect(service.selectedCity()).toBe('Pune');
  });
});

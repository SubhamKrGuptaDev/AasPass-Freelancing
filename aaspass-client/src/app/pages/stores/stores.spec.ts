import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CountryPickerComponent } from '../../components/location-picker/country-picker';
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

// jsdom lacks ResizeObserver and scrollIntoView, which the location pickers' overlay uses.
beforeAll(() => {
  if (typeof Element.prototype.scrollIntoView !== 'function') {
    Element.prototype.scrollIntoView = () => undefined;
  }
  if (typeof globalThis.ResizeObserver !== 'function') {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  }
});

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
    const cmp = await open('/stores?city=Pune&category=photography&q=reels&sort=views&open=1');
    expect(service.selectedCity()).toBe('Pune');
    expect(service.selectedCategory()).toBe('Photography');
    expect(service.searchQuery()).toBe('reels');
    expect(cmp.sort()).toBe('views');
    expect(cmp.openOnly()).toBe(true);
    expect(cmp.searchControl.value).toBe('reels');
  });

  it('applies any URL city as-is (trimmed)', async () => {
    await open('/stores?city=%20Austin%20');
    expect(service.selectedCity()).toBe('Austin');
  });

  it('applies URL country and city together', async () => {
    await open('/stores?country=united%20states&city=Austin');
    expect(service.selectedCountry()).toBe('United States');
    expect(service.selectedCity()).toBe('Austin');
    expect(router.url).toContain('country=United%20States');
  });

  it('re-canonicalises a lower-case country in the URL', async () => {
    await open('/stores?country=india&city=Pune');
    expect(service.selectedCountry()).toBe('India');
    expect(router.url).toContain('country=India');
  });

  it('keeps the current country and rewrites the URL when the country is unknown', async () => {
    await open('/stores?country=Atlantis&city=Pune');
    expect(service.selectedCountry()).toBe('India');
    expect(router.url).toContain('country=India');
    expect(router.url).not.toContain('Atlantis');
  });

  it('follows a navbar country change exactly once, dropping the city', async () => {
    await open('/stores?country=India&city=Pune');
    const spy = vi.spyOn(router, 'navigate');
    service.setSelectedCountry('Canada');
    TestBed.tick();
    await harness.fixture.whenStable();
    expect(router.url).toContain('country=Canada');
    expect(router.url).not.toContain('city=');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('restores the country text when the country picker is cleared', async () => {
    await open('/stores?country=India&city=Pune');
    const picker = harness.fixture.debugElement.query(By.directive(CountryPickerComponent)).componentInstance as CountryPickerComponent;
    picker.value.set('');
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(service.selectedCountry()).toBe('India');
    expect(picker.value()).toBe('India');
    expect((harness.routeNativeElement as HTMLElement).querySelector<HTMLInputElement>('input#stores-country')?.value).toBe('India');
  });

  it('shows a country-neutral subtitle', async () => {
    await open('/stores?city=Pune');
    expect((harness.routeNativeElement as HTMLElement).textContent).not.toContain('in your city');
  });

  it('treats an empty city as all cities and heads the list with the country', async () => {
    await open('/stores?country=Canada', [backendStore(1, { city: 'Toronto', country: 'Canada' } as Partial<BackendStoreResponse>)]);
    expect(service.selectedCity()).toBe('');
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.textContent).toContain('1 store in Canada');
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

  it('shows the sort label, not the raw key, in the sort trigger', async () => {
    await open('/stores?city=Pune');
    const text = (harness.routeNativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Top rated');
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('button#stores-sort-trigger')).not.toBeNull();
    expect(el.querySelector('label[for="stores-sort-trigger"]')).not.toBeNull();
    for (const id of ['stores-country', 'stores-city']) {
      expect(el.querySelector(`input#${id}`)).not.toBeNull();
      expect(el.querySelector(`label[for="${id}"]`)).not.toBeNull();
    }
  });

  it('accepts a retyped search term after a reset', async () => {
    vi.useFakeTimers();
    try {
      const cmp = await open('/stores?city=Pune');
      cmp.searchControl.setValue('react');
      await vi.advanceTimersByTimeAsync(350);
      expect(service.searchQuery()).toBe('react');
      cmp.resetFilters();
      expect(service.searchQuery()).toBe('');
      cmp.searchControl.setValue('react');
      await vi.advanceTimersByTimeAsync(350);
      expect(service.searchQuery()).toBe('react');
    } finally {
      vi.useRealTimers();
    }
  });

  it('re-canonicalises a bare /stores to the selected city after being on ?city=Pune', async () => {
    await open('/stores?city=Pune');
    expect(service.selectedCity()).toBe('Pune');
    await harness.navigateByUrl('/stores');
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(router.url).toContain('city=Pune');
  });

  it('shows singular count and hides count while loading', async () => {
    const cmp = await open('/stores?city=Pune', [backendStore(1)]);
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.textContent).toContain('1 store in Pune');
    expect(el.textContent).not.toContain('1 stores');
    expect(cmp.results().length).toBe(1);
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
    const cmp = await open('/stores?city=Pune&category=Web%20%26%20Tech', [
      backendStore(1, { city: 'Mumbai' }),
      backendStore(2, { city: 'Pune', category: 'Photography' }),
      backendStore(3, { city: 'Toronto', country: 'Canada' } as Partial<BackendStoreResponse>)
    ]);
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.textContent).toContain('0 stores in Pune');
    const links = Array.from(el.querySelectorAll('a')).map(a => a.getAttribute('href') ?? '');
    expect(links.some(h => h.includes('city=Mumbai'))).toBe(true);
    expect(links.some(h => h.includes('city=Pune'))).toBe(false);
    expect(links.some(h => h.includes('city=Toronto'))).toBe(false);

    cmp.setSort('views');
    cmp.setOpenOnly(true);
    cmp.resetFilters();
    expect(cmp.sort()).toBe('rating');
    expect(cmp.openOnly()).toBe(false);
    expect(cmp.searchControl.value).toBe('');
    expect(service.selectedCity()).toBe('Pune');
  });
});

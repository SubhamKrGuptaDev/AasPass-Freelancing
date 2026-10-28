import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GeoService } from './geo.service';
import { ToastService } from '../toast/toast.service';

describe('GeoService', () => {
  let service: GeoService;
  let http: HttpTestingController;
  let toast: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GeoService);
    http = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService);
  });

  afterEach(() => http.verify());

  it('resolves a country by trimmed, case-insensitive name', () => {
    expect(service.countryByName('  india ')?.code).toBe('IN');
    expect(service.countryByName('Atlantis')).toBeUndefined();
    expect(service.countryByName(null)).toBeUndefined();
  });

  it('loads cities once per country and caches them', () => {
    const cities = service.citiesFor('India');
    expect(service.isLoading('India')()).toBe(true);
    http.expectOne('geo/cities/IN.json').flush(['Pune', 'Bengaluru']);
    expect(cities()).toEqual(['Pune', 'Bengaluru']);
    expect(service.isLoading('India')()).toBe(false);

    expect(service.citiesFor('India')()).toEqual(['Pune', 'Bengaluru']);
    http.expectNone('geo/cities/IN.json');
  });

  it('returns an empty list and one error toast when the request fails', () => {
    const cities = service.citiesFor('India');
    http.expectOne('geo/cities/IN.json').flush('nope', { status: 404, statusText: 'Not Found' });
    expect(cities()).toEqual([]);
    expect(service.isLoading('India')()).toBe(false);
    expect(toast.toasts().filter((t) => t.type === 'error')).toHaveLength(1);
  });

  it('returns an empty list without a request for an unknown country', () => {
    expect(service.citiesFor('Atlantis')()).toEqual([]);
    expect(service.isLoading('Atlantis')()).toBe(false);
    http.expectNone(() => true);
  });
});

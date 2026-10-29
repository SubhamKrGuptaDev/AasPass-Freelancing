import { Service, Signal, WritableSignal, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { COUNTRIES, Country } from '../../geo/countries.generated';
import { findCountryByName } from '../../geo/country';
import { SKIP_ERROR_TOAST } from '../../interceptors/http-context';
import { ToastService } from '../toast.service';

export type { Country } from '../../geo/countries.generated';

interface CityState {
  cities: WritableSignal<readonly string[]>;
  loading: WritableSignal<boolean>;
  /** The last request failed; the entry is kept so reads do not refetch, only `retry` does. */
  failed: boolean;
}

/** Country list plus lazily loaded, per-country city lists (static files under /geo/cities). */
@Service()
export class GeoService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly countries: readonly Country[] = COUNTRIES;

  private readonly cache = new Map<string, CityState>();
  private readonly empty = signal<readonly string[]>([]).asReadonly();
  private readonly notLoading = signal(false).asReadonly();

  countryByName(name: string | null | undefined): Country | undefined {
    return findCountryByName(name);
  }

  /** Cities of a country; the first call fetches the file, later calls reuse the cache. */
  citiesFor(countryName: string): Signal<readonly string[]> {
    const code = this.countryByName(countryName)?.code;
    return code ? this.stateFor(code).cities.asReadonly() : this.empty;
  }

  isLoading(countryName: string): Signal<boolean> {
    const code = this.countryByName(countryName)?.code;
    return code ? this.stateFor(code).loading.asReadonly() : this.notLoading;
  }

  /** Re-requests the city list of a country whose last load failed; a no-op otherwise. */
  retry(countryName: string): void {
    const code = this.countryByName(countryName)?.code;
    const state = code ? this.cache.get(code) : undefined;
    if (code && state?.failed) {
      state.failed = false;
      state.loading.set(true);
      this.load(code, state);
    }
  }

  private stateFor(code: string): CityState {
    const cached = this.cache.get(code);
    if (cached) {
      return cached;
    }
    const state: CityState = {
      cities: signal<readonly string[]>([]),
      loading: signal(true),
      failed: false,
    };
    this.cache.set(code, state);
    this.load(code, state);
    return state;
  }

  private load(code: string, state: CityState): void {
    this.http
      .get<string[]>(`geo/cities/${code}.json`, {
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      })
      .subscribe({
        next: (cities) => {
          state.cities.set(Array.isArray(cities) ? cities : []);
          state.loading.set(false);
        },
        error: () => {
          state.failed = true;
          state.loading.set(false);
          this.toast.error('Could not load the city list. Please try again.');
        },
      });
  }
}

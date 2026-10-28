import { Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { COUNTRIES, Country } from '../../geo/countries.generated';
import { SKIP_ERROR_TOAST } from '../../interceptors/http-context';
import { ToastService } from '../toast/toast.service';

export type { Country } from '../../geo/countries.generated';

interface CityState {
  cities: WritableSignal<readonly string[]>;
  loading: WritableSignal<boolean>;
}

/** Country list plus lazily loaded, per-country city lists (static files under /geo/cities). */
@Injectable({
  providedIn: 'root'
})
export class GeoService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly countries: readonly Country[] = COUNTRIES;

  private readonly byName = new Map<string, Country>(
    COUNTRIES.map((c) => [c.name.trim().toLowerCase(), c]),
  );
  private readonly cache = new Map<string, CityState>();
  private readonly empty = signal<readonly string[]>([]).asReadonly();
  private readonly notLoading = signal(false).asReadonly();

  countryByName(name: string | null | undefined): Country | undefined {
    const key = name?.trim().toLowerCase();
    return key ? this.byName.get(key) : undefined;
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

  private stateFor(code: string): CityState {
    const cached = this.cache.get(code);
    if (cached) {
      return cached;
    }
    const state: CityState = {
      cities: signal<readonly string[]>([]),
      loading: signal(true),
    };
    this.cache.set(code, state);

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
          state.loading.set(false);
          this.toast.error('Could not load the city list. Please try again.');
        },
      });
    return state;
  }
}

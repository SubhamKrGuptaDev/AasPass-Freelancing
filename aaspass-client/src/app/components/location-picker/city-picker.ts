import { Component, computed, effect, forwardRef, inject, input, untracked } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
import { GeoService } from '../../services/geo/geo.service';
import { LocationPickerBase } from './location-picker-base';

/**
 * Searchable city picker for one country; the city list is loaded lazily via `GeoService`.
 *
 * `<app-city-picker [country]="country" [(value)]="city" />` or with `formControlName="city"`.
 *
 * When `country` changes from one known country to another (also via '' / unknown names in
 * between), the value is cleared unless the new country's list contains it (case-insensitive).
 * The check waits until that list has loaded, and a list that failed to load (empty, not
 * loading) keeps the value. The first known country is never reconciled (initialisation).
 */
@Component({
  selector: 'app-city-picker',
  imports: [HlmAutocompleteImports],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CityPickerComponent), multi: true },
  ],
  host: { class: 'block' },
  templateUrl: './city-picker.html',
})
export class CityPickerComponent extends LocationPickerBase {
  private readonly geo = inject(GeoService);

  /** Country name whose cities are offered (as in `GeoService.countries`). */
  readonly country = input.required<string>();
  readonly label = input<string>('City');

  protected readonly source = computed(() => this.geo.citiesFor(this.country())());
  protected readonly loading = computed(() => this.geo.isLoading(this.country())());
  protected readonly hasCountry = computed(() => !!this.geo.countryByName(this.country()));

  /**
   * Code of the last known country the value is valid for. Only known countries are recorded, so
   * passing through '' or an unknown name (A → '' → B) still reconciles B against A's value.
   */
  private checkedCode: string | undefined;

  constructor() {
    super();
    effect(() => {
      const country = this.country();
      const loading = this.loading();
      const cities = this.source();
      untracked(() => this.reconcileWithCountry(country, loading, cities));
    });
  }

  private reconcileWithCountry(country: string, loading: boolean, cities: readonly string[]): void {
    const code = this.geo.countryByName(country)?.code;
    if (!code || code === this.checkedCode) {
      return;
    }
    // First known country: the value was set for it (e.g. form initialisation). Record it on
    // sight, even while its list loads, so a later change is compared against it.
    if (this.checkedCode === undefined) {
      this.checkedCode = code;
      return;
    }
    // Compare only once the new country's list has loaded.
    if (loading) {
      return;
    }
    this.checkedCode = code;

    // Empty list after loading means the file failed or has no cities: keep the value.
    const current = this.value().trim().toLowerCase();
    if (!current || cities.length === 0) {
      return;
    }
    if (!cities.some((city) => city.toLowerCase() === current)) {
      this.commit('');
    }
  }
}

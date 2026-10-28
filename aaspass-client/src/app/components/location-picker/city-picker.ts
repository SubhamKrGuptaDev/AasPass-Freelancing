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
 * When `country` changes from one country to another, the value is cleared unless the new
 * country's list contains it (case-insensitive). The check waits until that list has loaded, and
 * a list that failed to load (empty, not loading) keeps the value.
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

  /** Country whose list the current value was last checked against. */
  private checkedCountry: string | undefined;

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
    if (country === this.checkedCountry || loading) {
      return;
    }
    const previous = this.checkedCountry;
    this.checkedCountry = country;

    // First country seen (or switching from none): the value was set for it, nothing to reconcile.
    // Empty list after loading means the file failed or has no cities: keep the value.
    const current = this.value().trim().toLowerCase();
    if (!previous || !current || cities.length === 0) {
      return;
    }
    if (!cities.some((city) => city.toLowerCase() === current)) {
      this.commit('');
    }
  }
}

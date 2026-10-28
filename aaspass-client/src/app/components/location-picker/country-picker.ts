import { Component, forwardRef, inject, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
import { GeoService } from '../../services/geo/geo.service';
import { LocationPickerBase } from './location-picker-base';

/**
 * Searchable country picker. Value is the country name (as in `GeoService.countries`).
 *
 * `<app-country-picker [(value)]="country" />` or `<app-country-picker formControlName="country" />`
 */
@Component({
  selector: 'app-country-picker',
  imports: [HlmAutocompleteImports],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CountryPickerComponent),
      multi: true,
    },
  ],
  host: { class: 'block' },
  templateUrl: './country-picker.html',
})
export class CountryPickerComponent extends LocationPickerBase {
  readonly label = input<string>('Country');

  protected readonly source = signal<readonly string[]>(
    inject(GeoService).countries.map((country) => country.name),
  ).asReadonly();
}

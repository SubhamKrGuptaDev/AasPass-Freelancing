import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Fails when the value is empty or whitespace-only (Validators.required accepts "   "). */
export const notBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: unknown = control.value;
  return typeof value === 'string' && value.trim().length > 0 ? null : { blank: true };
};

/** Fails when the trimmed value is shorter than {@code min} characters. */
export function minTrimmedLength(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;
    const length = typeof value === 'string' ? value.trim().length : 0;
    return length >= min ? null : { minTrimmedLength: { requiredLength: min, actualLength: length } };
  };
}

/** Group validator: fails when the two named controls hold different values. */
export function matchingFields(field: string, confirmField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const value: unknown = group.get(field)?.value;
    const confirm: unknown = group.get(confirmField)?.value;
    return value === confirm ? null : { fieldsMismatch: true };
  };
}

/** Long localized place names and directions links run well past 500 characters. */
export const GOOGLE_MAP_LINK_MAX_LENGTH = 2048;

/**
 * Blank (the field is optional), or a Google Maps link: maps.app.goo.gl/..., goo.gl/maps/...,
 * [www.|maps.]google.TLD/maps..., or maps.google.TLD[/?#]... where TLD is com, a 2-letter country code,
 * co.XX or com.XX, so look-alike hosts such as maps.google.com.evil.io are rejected.
 * Keep in sync with GOOGLE_MAP_LINK_REGEX in the backend's StoreCreateRequest.
 */
export const GOOGLE_MAP_LINK_PATTERN =
  /^\s*(?:https?:\/\/(?:maps\.app\.goo\.gl\/\S+|goo\.gl\/maps\/\S+|(?:www\.|maps\.)?google\.(?:com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})\/maps(?:[/?#]\S*)?|maps\.google\.(?:com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})(?:[/?#]\S*)?))?\s*$/i;

/** Review ratings are 1.0–5.0 in 0.1 steps; anything non-numeric falls back to 5.0. */
export function clampRating(value: unknown): number {
  const num = Number(value);
  if (isNaN(num)) {
    return 5.0;
  }
  return Math.max(1.0, Math.min(5.0, Math.round(num * 10) / 10));
}

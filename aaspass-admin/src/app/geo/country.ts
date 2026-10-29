import { COUNTRIES, Country } from './countries.generated';

/** Country assumed for stores/users that have none saved yet. */
export const DEFAULT_COUNTRY = 'India';

const BY_NAME = new Map<string, Country>(COUNTRIES.map((c) => [c.name.trim().toLowerCase(), c]));

/** Canonical country for a (trimmed, case-insensitive) name, or undefined when blank/unknown. */
export function findCountryByName(name: string | null | undefined): Country | undefined {
  const key = name?.trim().toLowerCase();
  return key ? BY_NAME.get(key) : undefined;
}

/** Lower-cases/trims a country name for comparison; missing or blank counts as the default country. */
export function normalizeCountry(country: string | null | undefined): string {
  return (country ?? '').trim().toLowerCase() || DEFAULT_COUNTRY.toLowerCase();
}

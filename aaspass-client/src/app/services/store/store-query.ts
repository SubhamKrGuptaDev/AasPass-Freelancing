import { ParamMap, Params } from '@angular/router';
import { StoreProfile } from '../../models/store.model';

export type StoreSortKey = 'rating' | 'price-asc' | 'price-desc' | 'experience' | 'views';

export const STORE_SORT_OPTIONS: ReadonlyArray<{ key: StoreSortKey; label: string }> = [
  { key: 'rating', label: 'Top rated' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'experience', label: 'Most experienced' },
  { key: 'views', label: 'Most viewed' }
];

export const DEFAULT_STORE_SORT: StoreSortKey = 'rating';
export const MAX_SEARCH_LENGTH = 100;

export interface StoresQuery {
  city: string | null;
  category: string;
  q: string;
  sort: StoreSortKey;
  openOnly: boolean;
}

/** Finds the canonical entry matching `value` (trimmed, case-insensitive), or null. */
function matchCanonical(value: string | null, options: readonly string[]): string | null {
  const needle = (value ?? '').trim().toLowerCase();
  if (!needle) {
    return null;
  }
  return options.find(option => option.toLowerCase() === needle) ?? null;
}

export function parseStoresQuery(
  params: ParamMap,
  cities: readonly string[],
  categories: readonly string[]
): StoresQuery {
  const rawSort = params.get('sort');
  const sort = STORE_SORT_OPTIONS.find(option => option.key === rawSort)?.key ?? DEFAULT_STORE_SORT;
  return {
    city: matchCanonical(params.get('city'), cities),
    category: matchCanonical(params.get('category'), categories) ?? 'All',
    q: (params.get('q') ?? '').trim().slice(0, MAX_SEARCH_LENGTH),
    sort,
    openOnly: params.get('open') === '1'
  };
}

export function toStoresQueryParams(query: StoresQuery): Params {
  return {
    city: query.city ?? null,
    category: query.category && query.category !== 'All' ? query.category : null,
    q: query.q ? query.q : null,
    sort: query.sort && query.sort !== DEFAULT_STORE_SORT ? query.sort : null,
    open: query.openOnly ? '1' : null
  };
}

const isMissing = (value: number | null | undefined): boolean => !Number.isFinite(value);

/** Compares numbers in the given direction; missing/non-finite values always sort last. */
function compareNumbers(a: number | null | undefined, b: number | null | undefined, dir: 'asc' | 'desc'): number {
  const aMissing = isMissing(a);
  const bMissing = isMissing(b);
  if (aMissing || bMissing) {
    return aMissing === bMissing ? 0 : aMissing ? 1 : -1;
  }
  return dir === 'asc' ? (a as number) - (b as number) : (b as number) - (a as number);
}

function compareByRating(a: StoreProfile, b: StoreProfile): number {
  return compareNumbers(a.rating, b.rating, 'desc') || compareNumbers(a.reviewCount, b.reviewCount, 'desc');
}

export function sortStores(stores: readonly StoreProfile[], sort: StoreSortKey): StoreProfile[] {
  const comparators: Record<StoreSortKey, (a: StoreProfile, b: StoreProfile) => number> = {
    'rating': compareByRating,
    'price-asc': (a, b) => compareNumbers(a.hourlyRate, b.hourlyRate, 'asc'),
    'price-desc': (a, b) => compareNumbers(a.hourlyRate, b.hourlyRate, 'desc'),
    'experience': (a, b) => compareNumbers(a.experienceYears, b.experienceYears, 'desc'),
    'views': (a, b) => compareNumbers(a.views?.lifetime ?? 0, b.views?.lifetime ?? 0, 'desc')
  };
  return [...stores].sort(comparators[sort] ?? compareByRating);
}

export function topStoresForCity(stores: readonly StoreProfile[], city: string, limit = 6): StoreProfile[] {
  const target = (city ?? '').trim().toLowerCase();
  const inCity = stores.filter(store => (store.city ?? '').trim().toLowerCase() === target);
  return sortStores(inCity, 'rating').slice(0, Math.max(0, limit));
}

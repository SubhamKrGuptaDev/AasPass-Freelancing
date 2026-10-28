import { convertToParamMap } from '@angular/router';
import { StoreProfile } from '../../models/store.model';
import {
  DEFAULT_STORE_SORT,
  STORE_SORT_OPTIONS,
  StoresQuery,
  parseStoresQuery,
  sortStores,
  toStoresQueryParams,
  topStoresForCity
} from './store-query';

const CITIES = ['Bengaluru', 'Delhi NCR', 'Mumbai', 'Pune', 'Hyderabad'];
const CATS = ['All', 'Video & Editing', 'Web & Tech', 'Photography'];

let seq = 0;
function makeStore(overrides: Partial<StoreProfile> = {}): StoreProfile {
  seq++;
  return {
    id: `s-${seq}`,
    userId: `u-${seq}`,
    ownerName: 'Owner',
    storeName: `Store ${seq}`,
    tagline: '',
    category: 'Web & Tech',
    skills: [],
    experienceYears: 1,
    hourlyRate: 500,
    startingPrice: 100,
    area: 'Area',
    city: 'Bengaluru',
    distanceKm: 1,
    serviceRadiusKm: 5,
    socialMediaLinks: [],
    description: '',
    services: [],
    rating: 4,
    reviewCount: 1,
    avatarUrl: '',
    bannerGradient: '',
    isAvailable: true,
    memberSince: '',
    creationDateTime: '',
    lastUpdateDateTime: '',
    ...overrides
  };
}

const ids = (stores: StoreProfile[]) => stores.map(s => s.id);
const views = (lifetime: number) => ({ daily: 0, weekly: 0, monthly: 0, lifetime });

describe('store-query', () => {
  it('exposes sort options with labels and default', () => {
    expect(DEFAULT_STORE_SORT).toBe('rating');
    expect(STORE_SORT_OPTIONS.map(o => o.label)).toEqual([
      'Top rated', 'Price: low to high', 'Price: high to low', 'Most experienced', 'Most viewed'
    ]);
  });

  it('parses canonical city/category case-insensitively', () => {
    const q = parseStoresQuery(convertToParamMap({ city: ' pune ', category: 'web & tech' }), CITIES, CATS);
    expect(q).toEqual({ city: 'Pune', category: 'Web & Tech', q: '', sort: 'rating', openOnly: false });
  });

  it('falls back on unknown values', () => {
    const q = parseStoresQuery(convertToParamMap({ city: 'Atlantis', category: 'Magic', sort: 'nope', open: 'yes' }), CITIES, CATS);
    expect(q).toEqual({ city: null, category: 'All', q: '', sort: 'rating', openOnly: false });
  });

  it('parses known sort, open=1 and trimmed q', () => {
    const q = parseStoresQuery(convertToParamMap({ sort: 'views', open: '1', q: ' reels ' }), CITIES, CATS);
    expect(q).toEqual({ city: null, category: 'All', q: 'reels', sort: 'views', openOnly: true });
  });

  it('trims and caps q at 100 chars', () => {
    expect(parseStoresQuery(convertToParamMap({ q: '  ' + 'a'.repeat(150) }), CITIES, CATS).q.length).toBe(100);
  });

  it('omits defaults when building params', () => {
    const base: StoresQuery = { city: 'Pune', category: 'All', q: '', sort: 'rating', openOnly: false };
    expect(toStoresQueryParams(base)).toEqual({ city: 'Pune', category: null, q: null, sort: null, open: null });
    expect(toStoresQueryParams({ city: 'Pune', category: 'Photography', q: 'reels', sort: 'views', openOnly: true }))
      .toEqual({ city: 'Pune', category: 'Photography', q: 'reels', sort: 'views', open: '1' });
    expect(toStoresQueryParams({ ...base, city: null })['city']).toBeNull();
  });

  describe('sortStores', () => {
    const a = makeStore({ id: 'a', rating: 4.5, reviewCount: 10, hourlyRate: 300, experienceYears: 2, views: views(50) });
    const b = makeStore({ id: 'b', rating: 4.5, reviewCount: 30, hourlyRate: 900, experienceYears: 8, views: views(500) });
    const c = makeStore({ id: 'c', rating: 3.0, reviewCount: 5, hourlyRate: 600, experienceYears: 5, views: undefined });

    it('sorts by each key without mutating input', () => {
      const input = [a, b, c];
      expect(ids(sortStores(input, 'rating'))).toEqual(['b', 'a', 'c']);
      expect(ids(sortStores(input, 'price-asc'))).toEqual(['a', 'c', 'b']);
      expect(ids(sortStores(input, 'price-desc'))).toEqual(['b', 'c', 'a']);
      expect(ids(sortStores(input, 'experience'))).toEqual(['b', 'c', 'a']);
      expect(ids(sortStores(input, 'views'))).toEqual(['b', 'a', 'c']);
      expect(ids(input)).toEqual(['a', 'b', 'c']);
    });

    it('puts missing/NaN numbers last for every sort, keeping input order otherwise', () => {
      const bad1 = makeStore({ id: 'x1', rating: undefined as unknown as number, hourlyRate: NaN, experienceYears: undefined as unknown as number });
      const bad2 = makeStore({ id: 'x2', rating: NaN, hourlyRate: undefined as unknown as number, experienceYears: NaN });
      const good1 = makeStore({ id: 'g1', rating: 4, hourlyRate: 100, experienceYears: 3, views: views(7) });
      const good2 = makeStore({ id: 'g2', rating: 5, hourlyRate: 200, experienceYears: 6, views: views(9) });
      const input = [bad1, good1, bad2, good2];
      expect(ids(sortStores(input, 'rating'))).toEqual(['g2', 'g1', 'x1', 'x2']);
      expect(ids(sortStores(input, 'price-asc'))).toEqual(['g1', 'g2', 'x1', 'x2']);
      expect(ids(sortStores(input, 'price-desc'))).toEqual(['g2', 'g1', 'x1', 'x2']);
      expect(ids(sortStores(input, 'experience'))).toEqual(['g2', 'g1', 'x1', 'x2']);
      expect(ids(sortStores(input, 'views'))).toEqual(['g2', 'g1', 'x1', 'x2']);
    });
  });

  describe('topStoresForCity', () => {
    it('filters by city case-insensitively, ranks by rating then reviewCount, caps at 6', () => {
      const blr = Array.from({ length: 8 }, (_, i) =>
        makeStore({ id: `b${i}`, city: 'Bengaluru', rating: 4 + i * 0.1, reviewCount: 1 }));
      const tieLow = makeStore({ id: 'tieLow', city: 'bengaluru', rating: 5, reviewCount: 2 });
      const tieHigh = makeStore({ id: 'tieHigh', city: 'Bengaluru', rating: 5, reviewCount: 20 });
      const pune = [makeStore({ id: 'p1', city: 'Pune', rating: 5 }), makeStore({ id: 'p2', city: 'Pune', rating: 5 })];
      const result = topStoresForCity([...pune, ...blr, tieLow, tieHigh], ' BENGALURU ', 6);
      expect(ids(result)).toEqual(['tieHigh', 'tieLow', 'b7', 'b6', 'b5', 'b4']);
    });

    it('defaults limit to 6 and returns [] for no matches', () => {
      const many = Array.from({ length: 9 }, () => makeStore({ city: 'Mumbai' }));
      expect(topStoresForCity(many, 'Mumbai').length).toBe(6);
      expect(topStoresForCity(many, 'Pune')).toEqual([]);
    });
  });
});

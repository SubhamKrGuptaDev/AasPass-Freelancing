import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StoreService } from './store.service';
import { AuthService } from '../auth/auth.service';
import { StoreProfile, StoreReview } from '../../models/store.model';

const fixtureStore1: StoreProfile = {
  id: 'store-1',
  userId: 'user-101',
  ownerName: 'Priya Nair',
  storeName: 'PixelCraft Studios',
  tagline: 'Short-form Reels, TikToks & YouTube Shorts Editor',
  category: 'Video & Editing',
  skills: ['Premiere Pro', 'CapCut', 'Color Grading'],
  experienceYears: 2,
  hourlyRate: 500,
  startingPrice: 350,
  area: 'Indiranagar',
  city: 'Bengaluru',
  country: 'India',
  serviceRadiusKm: 6,
  socialMediaLinks: [
    { id: 'sm-1-1', name: 'Instagram', url: 'https://instagram.com/priya_edits' },
    { id: 'sm-1-2', name: 'YouTube', url: 'https://youtube.com/@priyaedits' }
  ],
  description: 'Video editor specializing in fast-paced reels.',
  services: [
    { id: 's1', name: 'Instagram Reel', price: 450, duration: '24 hrs', description: 'Reel edit' }
  ],
  rating: 4.9,
  reviewCount: 1,
  reviews: [
    {
      id: 'rev-101',
      storeId: 'store-1',
      userName: 'Rahul Verma',
      rating: 5.0,
      message: 'Clean delivery in under 24 hours!',
      date: '2 days ago'
    }
  ],
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  bannerGradient: 'from-pink-500 to-rose-600',
  isAvailable: true,
  views: { daily: 42, weekly: 285, monthly: 1140, lifetime: 3820 },
  memberSince: 'Jan 2026',
  creationDateTime: '2026-01-10T08:30:00.000Z',
  lastUpdateDateTime: '2026-03-12T14:20:00.000Z'
};

const fixtureStore2: StoreProfile = {
  id: 'store-2',
  userId: 'user-102',
  ownerName: 'Rohan Gupta',
  storeName: 'CodeSpark Lab',
  tagline: 'Full-stack Web Apps, Landing Pages & Custom Scripts',
  category: 'Web & Tech',
  skills: ['Angular', 'Node.js', 'Tailwind CSS'],
  experienceYears: 4,
  hourlyRate: 800,
  startingPrice: 1500,
  area: 'Koramangala',
  city: 'Bengaluru',
  country: 'India',
  serviceRadiusKm: 10,
  socialMediaLinks: [],
  description: 'Freelance engineer crafting SPAs and landing pages.',
  services: [],
  rating: 5.0,
  reviewCount: 1,
  reviews: [
    {
      id: 'rev-201',
      storeId: 'store-2',
      userName: 'Ananya Rao',
      rating: 5.0,
      message: 'Zero bugs during launch.',
      date: 'Yesterday'
    }
  ],
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
  bannerGradient: 'from-blue-600 to-indigo-700',
  isAvailable: true,
  views: { daily: 64, weekly: 410, monthly: 1680, lifetime: 5200 },
  memberSince: 'Feb 2026',
  creationDateTime: '2026-02-05T09:15:00.000Z',
  lastUpdateDateTime: '2026-03-14T16:45:00.000Z'
};

describe('StoreService Reviews & Ratings', () => {
  let service: StoreService;
  let httpTesting: HttpTestingController;

  /** Submits a review and confirms it with a 200 from the backend; returns the inserted review. */
  function addReview(storeId: string, data: { rating: number; message: string }): StoreReview {
    let result: StoreReview | undefined;
    service.addReview(storeId, data).subscribe(r => (result = r));
    httpTesting.expectOne(r => r.method === 'POST' && r.url.endsWith('/reviews'))
      .flush({ success: true, message: 'ok', data: {} });
    return result!;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(StoreService);
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.inject(AuthService).setCurrentUser({ ...service.currentUser(), id: 'user-9', name: 'Kavita Menon' });
    // Initialize with clone of test fixture stores
    service.stores.set([
      JSON.parse(JSON.stringify(fixtureStore1)),
      JSON.parse(JSON.stringify(fixtureStore2))
    ]);
  });

  it('should expose the 32 store categories in order', () => {
    expect(service.categories).toEqual([
      'All',
      'Video & Editing',
      'Web & Tech',
      'Photography',
      'Tutoring & Education',
      'Graphics & Design',
      'Tech Support & Hardware',
      'Astrology & Spiritual',
      'Driving & Transport',
      'Fitness & Self-Defense',
      'Art, Music & Hobbies',
      'Home & Personal Services',
      'Event Management',
      'Interior Design & Planning',
      'Mehendi Design',
      'Pandit & Puja Services',
      'Decoration & Florist',
      'Beauty, Makeup & Salon',
      'Catering & Home Cooking',
      'Tailoring & Fashion',
      'Electrician & Plumbing',
      'Carpentry & Painting',
      'Appliance Repair',
      'Cleaning & Pest Control',
      'Pet Care',
      'Babysitting & Elder Care',
      'Packers & Movers',
      'Health & Wellness',
      'Legal, Tax & Accounting',
      'Marketing & Social Media',
      'Writing & Translation',
      'DJ & Live Entertainment'
    ]);
  });

  it('should initialize with test stores', () => {
    expect(service.stores().length).toBe(2);
    expect(service.stores()[0].storeName).toBe('PixelCraft Studios');
    expect(service.stores()[1].storeName).toBe('CodeSpark Lab');
  });

  describe('store URL keys (name + id)', () => {
    it('should build "<name>-<id>" keys for persisted stores', () => {
      expect(service.getStoreUrlKey({ ...fixtureStore1, id: '12', storeName: "Subham's Plumbing & Co." })).toBe('subhams-plumbing-co-12');
      expect(service.getStoreUrlKey({ ...fixtureStore1, id: '7', storeName: 'Café Shop 24' })).toBe('cafe-shop-24-7');
    });

    it('should fall back to the bare id when the name has no URL-safe characters or the id is a local one', () => {
      expect(service.getStoreUrlKey({ ...fixtureStore1, id: '5', storeName: 'दुकान' })).toBe('5');
      expect(service.getStoreUrlKey(fixtureStore1)).toBe('store-1');
      expect(service.getStoreUrlKey(undefined)).toBe('');
    });

    it('should resolve stores with duplicate names by their trailing id', () => {
      service.stores.set([
        { ...fixtureStore1, id: '12', storeName: 'Same Name' },
        { ...fixtureStore2, id: '24', storeName: 'Same Name' }
      ]);
      expect(service.getStoreByUrlKey('same-name-12')?.id).toBe('12');
      expect(service.getStoreByUrlKey('same-name-24')?.id).toBe('24');
      // Old id-only links and links with an outdated name still resolve
      expect(service.getStoreByUrlKey('24')?.id).toBe('24');
      expect(service.getStoreByUrlKey('old-name-12')?.id).toBe('12');
    });

    it('should resolve unsaved local stores by their client id', () => {
      expect(service.getStoreByUrlKey('store-1')?.storeName).toBe('PixelCraft Studios');
    });
  });

  it('should add a review and update average rating and review count', () => {
    const storeId = 'store-1';
    const initialStore = service.getStoreById(storeId)!;
    expect(initialStore.reviewCount).toBe(1);
    expect(initialStore.rating).toBe(4.9);

    // Add a new 5.0 star review
    const newRev = addReview(storeId, { rating: 5.0,
      message: 'Exceptional editing speed!'
    });

    expect(newRev.id).toBeDefined();
    expect(newRev.storeId).toBe(storeId);
    expect(newRev.userName).toBe('Kavita Menon');
    expect(newRev.rating).toBe(5.0);

    const updatedStore = service.getStoreById(storeId)!;
    expect(updatedStore.reviewCount).toBe(2);
    // (5.0 + 5.0) / 2 = 5.0
    expect(updatedStore.rating).toBe(5.0);
    expect(updatedStore.reviews?.[0].userName).toBe('Kavita Menon');
    expect(updatedStore.reviews?.length).toBe(2);
  });

  it('should clamp ratings strictly between 1.0 and 5.0', () => {
    const storeId = 'store-2';

    // Attempting rating > 5.0 should be clamped to 5.0
    const overReview = addReview(storeId, { rating: 9.9,
      message: 'Way above max'
    });
    expect(overReview.rating).toBe(5.0);

    // Attempting rating < 1.0 should be clamped to 1.0
    const underReview = addReview(storeId, { rating: -2.5,
      message: 'Below min'
    });
    expect(underReview.rating).toBe(1.0);
  });

  it('should round ratings to 1 decimal place', () => {
    const storeId = 'store-2';
    // Store 2 currently has 1 review of 5.0, plus the two reviews below:
    // (5.0 + 3.33 + 4.67) / 3 = 4.3333... -> 4.3
    addReview(storeId, { rating: 3.33, message: 'Good' });
    addReview(storeId, { rating: 4.67, message: 'Great' });

    const updatedStore = service.getStoreById(storeId)!;
    expect(updatedStore.rating).toBe(4.3);
    expect(updatedStore.reviewCount).toBe(3);
  });

  it('should prepend newest review at index 0 of reviews array', () => {
    const storeId = 'store-1';
    addReview(storeId, { rating: 4.5,
      message: 'First new'
    });
    addReview(storeId, { rating: 5.0,
      message: 'Second new'
    });

    const store = service.getStoreById(storeId)!;
    expect(store.reviews?.[0].message).toBe('Second new');
    expect(store.reviews?.[1].message).toBe('First new');
  });

  it('should update currentUser store reference if reviewing owned store', () => {
    const ownedStoreId = 'store-user-owned';
    const userStore: StoreProfile = {
      ...fixtureStore1,
      id: ownedStoreId,
      userId: service.currentUser().id,
      storeName: 'My Owned Store',
      rating: 5.0,
      reviewCount: 1,
      reviews: [
        { id: 'r1', storeId: ownedStoreId, userName: 'First', rating: 5.0, message: 'Nice', date: 'Now' }
      ]
    };

    // Set user to own this store
    TestBed.inject(AuthService).setCurrentUser({ ...service.currentUser(), hasStore: true, store: userStore, stores: [userStore] });
    service.stores.update(list => [userStore, ...list]);

    // Add review to owned store
    addReview(ownedStoreId, { rating: 3.0,
      message: 'Average delivery'
    });

    // Check that currentUser.store and currentUser.stores updated synchronously
    const activeUser = service.currentUser();
    expect(activeUser.store?.reviewCount).toBe(2);
    expect(activeUser.store?.rating).toBe(4.0);
    expect(activeUser.stores?.[0].rating).toBe(4.0);
  });

  describe('Store Views and Engagement Metrics', () => {
    it('should initialize store with default views when created', () => {
      const created = service.createStore({
        storeName: 'Test New Photography Studio',
        ownerName: 'Test Owner',
        tagline: 'Pro Portfolios',
        category: 'Photography',
        skills: ['Portraits', 'Lightroom'],
        experienceYears: 3,
        hourlyRate: 600,
        startingPrice: 1200,
        area: 'Indiranagar',
        city: 'Bengaluru',
       
        serviceRadiusKm: 8,
        socialMediaLinks: [],
        description: 'Quality photo shoots',
        services: [],
        avatarUrl: '',
        bannerGradient: 'from-blue-500 to-indigo-600',
        isAvailable: true
      });

      expect(created.views).toBeDefined();
      expect(created.views?.daily).toBe(1);
      expect(created.views?.weekly).toBe(1);
      expect(created.views?.monthly).toBe(1);
      expect(created.views?.lifetime).toBe(1);
      expect(created.viewHistory).toBeDefined();
      expect(created.viewHistory!.length).toBe(1);
    });

    it('should return views using getStoreViews helper with default fallback if views undefined', () => {
      const storeWithoutViews: StoreProfile = {
        ...fixtureStore1,
        id: 'store-no-views',
        views: undefined as any
      };
      service.stores.update(l => [storeWithoutViews, ...l]);

      const views = service.getStoreViews('store-no-views');
      expect(views).toEqual({ daily: 0, weekly: 0, monthly: 0, lifetime: 0 });
    });

    it('should retrieve existing store views correctly', () => {
      const views1 = service.getStoreViews('store-1');
      expect(views1.daily).toBe(42);
      expect(views1.weekly).toBe(285);
      expect(views1.monthly).toBe(1140);
      expect(views1.lifetime).toBe(3820);

      const views2 = service.getStoreViews('store-2');
      expect(views2.daily).toBe(64);
      expect(views2.weekly).toBe(410);
      expect(views2.monthly).toBe(1680);
      expect(views2.lifetime).toBe(5200);
    });

    it('should increment daily, weekly, monthly and lifetime counters upon recording view', () => {
      const storeId = 'store-1';
      const initialViews = service.getStoreViews(storeId);

      // Record a single store view simulation
      service.recordStoreView(storeId, 'test-viewer-123');

      const updatedViews = service.getStoreViews(storeId);
      expect(updatedViews.daily).toBe(initialViews.daily + 1);
      expect(updatedViews.weekly).toBe(initialViews.weekly + 1);
      expect(updatedViews.monthly).toBe(initialViews.monthly + 1);
      expect(updatedViews.lifetime).toBe(initialViews.lifetime + 1);

      // Verify view history prepended
      const store = service.getStoreById(storeId)!;
      expect(store.viewHistory).toBeDefined();
      expect(store.viewHistory![0].storeId).toBe(storeId);
      expect(store.viewHistory![0].viewerId).toBe('test-viewer-123');
    });

    it('should accurately retrieve specific engagement counts for daily, weekly, monthly, lifetime', () => {
      const storeId = 'store-2';
      expect(service.getStoreEngagement(storeId, 'daily')).toBe(64);
      expect(service.getStoreEngagement(storeId, 'weekly')).toBe(410);
      expect(service.getStoreEngagement(storeId, 'monthly')).toBe(1680);
      expect(service.getStoreEngagement(storeId, 'lifetime')).toBe(5200);

      // Record 3 views
      service.recordStoreView(storeId);
      service.recordStoreView(storeId);
      service.recordStoreView(storeId);

      expect(service.getStoreEngagement(storeId, 'daily')).toBe(67);
      expect(service.getStoreEngagement(storeId, 'weekly')).toBe(413);
      expect(service.getStoreEngagement(storeId, 'monthly')).toBe(1683);
      expect(service.getStoreEngagement(storeId, 'lifetime')).toBe(5203);
    });

    it('should replace the optimistic count with the backend counters from the view response', () => {
      service.stores.update(list => [{ ...fixtureStore1, id: '41', userId: 'someone-else' }, ...list]);

      service.recordStoreView('41');
      expect(service.getStoreViews('41').lifetime).toBe(3821);

      // Other visitors were counted on the backend since the list was loaded
      httpTesting.expectOne(r => r.method === 'POST' && r.url.endsWith('/stores/41/views')).flush({
        success: true, message: 'ok',
        data: { id: 41, storeName: 'Fresh', views: { daily: 50, weekly: 300, monthly: 1200, lifetime: 3900 } }
      });

      expect(service.getStoreViews('41')).toEqual({ daily: 50, weekly: 300, monthly: 1200, lifetime: 3900 });
    });

    it('should reload but not count or send a view when the current user owns the target store', () => {
      const ownedStoreId = '42';
      const myStore: StoreProfile = {
        ...fixtureStore1,
        id: ownedStoreId,
        userId: service.currentUser().id,
        views: { daily: 10, weekly: 50, monthly: 150, lifetime: 500 },
        viewHistory: []
      };

      TestBed.inject(AuthService).setCurrentUser({ ...service.currentUser(), hasStore: true, store: myStore, stores: [myStore] });
      service.stores.update(list => [myStore, ...list]);

      service.recordStoreView(ownedStoreId);

      expect(service.getStoreViews(ownedStoreId).lifetime).toBe(500);
      expect(service.getStoreById(ownedStoreId)?.viewHistory).toEqual([]);
      expect(service.currentUser().store?.views?.lifetime).toBe(500);
      httpTesting.expectNone(r => r.url.endsWith(`/views`));

      httpTesting.expectOne(r => r.method === 'GET' && r.url.endsWith('/stores/42')).flush({
        success: true, message: 'ok',
        data: { id: 42, storeName: 'Mine', views: { daily: 12, weekly: 60, monthly: 160, lifetime: 520 } }
      });
      expect(service.getStoreViews(ownedStoreId).lifetime).toBe(520);
    });

    it('should isolate view counts between different stores independently', () => {
      const storeAId = 'store-1';
      const storeBId = 'store-2';

      const storeABefore = service.getStoreViews(storeAId);
      const storeBBefore = service.getStoreViews(storeBId);

      // Record view specifically on Store A
      service.recordStoreView(storeAId);

      const storeAAfter = service.getStoreViews(storeAId);
      const storeBAfter = service.getStoreViews(storeBId);

      // Store A incremented
      expect(storeAAfter.daily).toBe(storeABefore.daily + 1);
      expect(storeAAfter.lifetime).toBe(storeABefore.lifetime + 1);

      // Store B remained unchanged!
      expect(storeBAfter.daily).toBe(storeBBefore.daily);
      expect(storeBAfter.weekly).toBe(storeBBefore.weekly);
      expect(storeBAfter.monthly).toBe(storeBBefore.monthly);
      expect(storeBAfter.lifetime).toBe(storeBBefore.lifetime);
    });
  });

  describe('country filtering', () => {
    beforeEach(() => {
      service.stores.update(list => [
        ...list,
        { ...fixtureStore1, id: 'store-us', country: 'United States', city: 'Austin' }
      ]);
    });

    it('filters by country', () => {
      service.setSelectedCity('');
      expect(service.filteredStores().map(s => s.id)).toEqual(['store-1', 'store-2']);
      service.setSelectedCountry('United States');
      expect(service.filteredStores().map(s => s.id)).toEqual(['store-us']);
    });

    it('treats a store without country as India (case-insensitive, trimmed)', () => {
      service.stores.update(list => [
        ...list,
        { ...fixtureStore1, id: 'no-country', country: '  ' },
        { ...fixtureStore1, id: 'lower', country: ' india ', city: ' BENGALURU ' }
      ]);
      service.setSelectedCity('bengaluru');
      expect(service.filteredStores().map(s => s.id)).toEqual(['store-1', 'store-2', 'no-country', 'lower']);
    });

    it('setSelectedCountry clears city only when the country changes', () => {
      service.setSelectedCity('Pune');
      service.setSelectedCountry('india');
      expect(service.selectedCity()).toBe('Pune');
      service.setSelectedCountry('United States');
      expect(service.selectedCountry()).toBe('United States');
      expect(service.selectedCity()).toBe('');
    });

    it('setSelectedCountry ignores blank or unknown names', () => {
      service.setSelectedCountry('  ');
      service.setSelectedCountry('Atlantis');
      expect(service.selectedCountry()).toBe('India');
      expect(service.selectedCity()).toBe('Bengaluru');
    });

    it('citiesWithStores is distinct and sorted for the selected country', () => {
      service.stores.update(list => [
        ...list,
        { ...fixtureStore1, id: 'x', city: 'Aurangabad' },
        { ...fixtureStore1, id: 'y', city: 'Bengaluru' }
      ]);
      expect(service.citiesWithStores()).toEqual(['Aurangabad', 'Bengaluru']);
      service.setSelectedCountry('United States');
      expect(service.citiesWithStores()).toEqual(['Austin']);
    });

    it('maps a backend store without country to India', () => {
      const raw = { id: 1, userId: 2, storeName: 'S', category: 'c', area: 'a', city: 'Pune' };
      expect(service.mapBackendStoreToProfile(raw).country).toBe('India');
      expect(service.mapBackendStoreToProfile({ ...raw, country: 'United States' }).country).toBe('United States');
    });
  });
});

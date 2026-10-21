import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StoreService } from './store.service';
import { StoreProfile } from '../../models/store.model';

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
  distanceKm: 0.8,
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
  distanceKm: 1.4,
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(StoreService);
    // Initialize with clone of test fixture stores
    service.stores.set([
      JSON.parse(JSON.stringify(fixtureStore1)),
      JSON.parse(JSON.stringify(fixtureStore2))
    ]);
  });

  it('should initialize with test stores', () => {
    expect(service.stores().length).toBe(2);
    expect(service.stores()[0].storeName).toBe('PixelCraft Studios');
    expect(service.stores()[1].storeName).toBe('CodeSpark Lab');
  });

  it('should add a review and update average rating and review count', () => {
    const storeId = 'store-1';
    const initialStore = service.getStoreById(storeId)!;
    expect(initialStore.reviewCount).toBe(1);
    expect(initialStore.rating).toBe(4.9);

    // Add a new 5.0 star review
    const newRev = service.addReview(storeId, {
      userName: 'Kavita Menon',
      rating: 5.0,
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
    const overReview = service.addReview(storeId, {
      userName: 'Tester A',
      rating: 9.9,
      message: 'Way above max'
    });
    expect(overReview.rating).toBe(5.0);

    // Attempting rating < 1.0 should be clamped to 1.0
    const underReview = service.addReview(storeId, {
      userName: 'Tester B',
      rating: -2.5,
      message: 'Below min'
    });
    expect(underReview.rating).toBe(1.0);
  });

  it('should round ratings to 1 decimal place', () => {
    const storeId = 'store-2';
    // Store 2 currently has 1 review of 5.0, plus the two reviews below:
    // (5.0 + 3.33 + 4.67) / 3 = 4.3333... -> 4.3
    service.addReview(storeId, { userName: 'U1', rating: 3.33, message: 'Good' });
    service.addReview(storeId, { userName: 'U2', rating: 4.67, message: 'Great' });

    const updatedStore = service.getStoreById(storeId)!;
    expect(updatedStore.rating).toBe(4.3);
    expect(updatedStore.reviewCount).toBe(3);
  });

  it('should prepend newest review at index 0 of reviews array', () => {
    const storeId = 'store-1';
    service.addReview(storeId, {
      userName: 'First New User',
      rating: 4.5,
      message: 'First new'
    });
    service.addReview(storeId, {
      userName: 'Second New User',
      rating: 5.0,
      message: 'Second new'
    });

    const store = service.getStoreById(storeId)!;
    expect(store.reviews?.[0].userName).toBe('Second New User');
    expect(store.reviews?.[1].userName).toBe('First New User');
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
    service.currentUser.update(u => ({ ...u, hasStore: true, store: userStore, stores: [userStore] }));
    service.stores.update(list => [userStore, ...list]);

    // Add review to owned store
    service.addReview(ownedStoreId, {
      userName: 'Customer C',
      rating: 3.0,
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
        distanceKm: 2.1,
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

    it('should update currentUser store views if current user owns the target store', () => {
      const ownedStoreId = 'store-owned-engagement';
      const myStore: StoreProfile = {
        ...fixtureStore1,
        id: ownedStoreId,
        userId: service.currentUser().id,
        views: { daily: 10, weekly: 50, monthly: 150, lifetime: 500 },
        viewHistory: []
      };

      service.currentUser.update(u => ({ ...u, hasStore: true, store: myStore, stores: [myStore] }));
      service.stores.update(list => [myStore, ...list]);

      service.recordStoreView(ownedStoreId, 'client-456');

      const activeUser = service.currentUser();
      expect(activeUser.store?.views?.daily).toBe(11);
      expect(activeUser.store?.views?.lifetime).toBe(501);
      expect(activeUser.stores?.[0].views?.daily).toBe(11);
      expect(activeUser.stores?.[0].views?.lifetime).toBe(501);
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

});

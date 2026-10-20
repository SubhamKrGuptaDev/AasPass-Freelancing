import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StoreService } from './store.service';
import { StoreProfile } from '../models/store.model';

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
    service.stores.set([fixtureStore1, fixtureStore2]);
  });

  it('should be created with initial stores having reviews', () => {
    expect(service).toBeTruthy();
    const stores = service.stores();
    expect(stores.length).toBeGreaterThan(0);
    const store1 = stores.find(s => s.id === 'store-1');
    expect(store1).toBeDefined();
    expect(store1?.reviews).toBeDefined();
    expect(store1?.reviews?.length).toBeGreaterThan(0);
    expect(store1?.reviews?.[0].userName).toBeTruthy();
    expect(store1?.reviews?.[0].rating).toBeGreaterThanOrEqual(1.0);
    expect(store1?.reviews?.[0].rating).toBeLessThanOrEqual(5.0);
    expect(store1?.reviews?.[0].message).toBeTruthy();
  });

  it('should add a review and update average rating and count', () => {
    const storeId = 'store-1';
    const storeBefore = service.getStoreById(storeId);
    const initialCount = storeBefore?.reviews?.length || 0;

    const newReview = service.addReview(storeId, {
      userName: 'Kavita Singh',
      rating: 5.0,
      message: 'Exceptional speed and quality!'
    });

    expect(newReview.userName).toBe('Kavita Singh');
    expect(newReview.rating).toBe(5.0);
    expect(newReview.message).toBe('Exceptional speed and quality!');

    const storeAfter = service.getStoreById(storeId);
    expect(storeAfter?.reviews?.length).toBe(initialCount + 1);
    expect(storeAfter?.reviews?.[0].id).toBe(newReview.id);
    expect(storeAfter?.rating).toBeGreaterThanOrEqual(1.0);
    expect(storeAfter?.rating).toBeLessThanOrEqual(5.0);
  });

  it('should clamp ratings below 1.0 to 1.0 and above 5.0 to 5.0', () => {
    const storeId = 'store-2';

    // Test below minimum (e.g. 0.2 or negative)
    const lowReview = service.addReview(storeId, {
      userName: 'Low Reviewer',
      rating: 0.5,
      message: 'Too low rating attempt'
    });
    expect(lowReview.rating).toBe(1.0);

    // Test above maximum (e.g. 7.5)
    const highReview = service.addReview(storeId, {
      userName: 'High Reviewer',
      rating: 9.9,
      message: 'Too high rating attempt'
    });
    expect(highReview.rating).toBe(5.0);
  });

  it('should support multiple social media links with names and direct redirect URLs', () => {
    const stores = service.stores();
    const store1 = stores.find(s => s.id === 'store-1');
    expect(store1?.socialMediaLinks).toBeDefined();
    expect(store1?.socialMediaLinks.length).toBeGreaterThanOrEqual(2);

    const instagramLink = store1?.socialMediaLinks.find(l => l.name === 'Instagram');
    expect(instagramLink).toBeDefined();
    expect(instagramLink?.url).toBe('https://instagram.com/priya_edits');

    const youtubeLink = store1?.socialMediaLinks.find(l => l.name === 'YouTube');
    expect(youtubeLink).toBeDefined();
    expect(youtubeLink?.url).toBe('https://youtube.com/@priyaedits');
  });

  it('should create a store with multiple custom social media links', () => {
    const customLinks = [
      { id: 'sm-test-1', name: 'Instagram', url: 'https://instagram.com/subha_creatives' },
      { id: 'sm-test-2', name: 'LinkedIn', url: 'https://linkedin.com/in/subha' },
      { id: 'sm-test-3', name: 'Behance Portfolio', url: 'https://behance.net/subha' }
    ];

    const newStore = service.createStore({
      ownerName: 'Subha Test',
      storeName: 'Subha Visuals',
      tagline: 'High end motion design & branding',
      category: 'Video & Editing',
      skills: ['Motion Design', 'After Effects'],
      experienceYears: 4,
      hourlyRate: 750,
      startingPrice: 500,
      area: 'Indiranagar',
      city: 'Bengaluru',
      distanceKm: 0.5,
      serviceRadiusKm: 10,
      socialMediaLinks: customLinks,
      description: 'Freelance creator studio with full video editing stack.',
      services: [
        { id: 's-t1', name: 'Reel Edit', price: 500, duration: '24 hours', description: 'Reel edit' }
      ],
      avatarUrl: 'https://example.com/avatar.jpg',
      bannerGradient: 'from-blue-600 to-indigo-700',
      isAvailable: true
    });

    expect(newStore.id).toBeTruthy();
    expect(newStore.socialMediaLinks.length).toBe(3);
    expect(newStore.socialMediaLinks[0].name).toBe('Instagram');
    expect(newStore.socialMediaLinks[0].url).toBe('https://instagram.com/subha_creatives');
    expect(newStore.socialMediaLinks[2].name).toBe('Behance Portfolio');
    expect(newStore.socialMediaLinks[2].url).toBe('https://behance.net/subha');
  });

  it('should include creationDateTime and lastUpdateDateTime in UserProfile and StoreProfile', () => {
    const user = service.currentUser();
    // In guest mode, currentUser starts with EMPTY_USER_PROFILE
    expect(user).toBeDefined();

    const store1 = service.stores()[0];
    expect(store1.creationDateTime).toBeTruthy();
    expect(store1.lastUpdateDateTime).toBeTruthy();
    expect(new Date(store1.creationDateTime).getTime()).not.toBeNaN();
    expect(new Date(store1.lastUpdateDateTime).getTime()).not.toBeNaN();

    // Verify updateUserProfile sets lastUpdateDateTime
    service.updateUserProfile({ name: 'Test User', bio: 'Updated bio for testing' });
    const afterUpdateUser = service.currentUser();
    expect(afterUpdateUser.bio).toBe('Updated bio for testing');
    expect(afterUpdateUser.lastUpdateDateTime).toBeTruthy();

    // Verify createStore sets creationDateTime and lastUpdateDateTime
    const newStore = service.createStore({
      ownerName: afterUpdateUser.name,
      storeName: 'Timestamp Test Store',
      tagline: 'Fast and reliable services',
      category: 'Web & Tech',
      skills: ['TypeScript'],
      experienceYears: 1,
      hourlyRate: 500,
      startingPrice: 300,
      area: 'Indiranagar',
      city: 'Bengaluru',
      distanceKm: 0.5,
      serviceRadiusKm: 5,
      socialMediaLinks: [],
      description: 'Test description',
      services: [],
      avatarUrl: afterUpdateUser.avatarUrl,
      bannerGradient: 'from-blue-600 to-indigo-700',
      isAvailable: true
    });

    expect(newStore.creationDateTime).toBeTruthy();
    expect(newStore.lastUpdateDateTime).toBeTruthy();
    expect(new Date(newStore.creationDateTime).getTime()).not.toBeNaN();
  });

  it('should allow 1 user to create, hold, and switch between multiple stores', () => {
    expect(service.userStores().length).toBe(0);

    // Create 1st store
    const store1 = service.createStore({
      ownerName: service.currentUser().name,
      storeName: 'Aman First Tech Store',
      tagline: 'Custom web solutions',
      category: 'Web & Tech',
      skills: ['Angular', 'TypeScript'],
      experienceYears: 2,
      hourlyRate: 600,
      startingPrice: 500,
      area: 'Indiranagar',
      city: 'Bengaluru',
      distanceKm: 0.2,
      serviceRadiusKm: 5,
      socialMediaLinks: [{ id: 'sm-1', name: 'GitHub', url: 'https://github.com/test' }],
      description: 'Web development services',
      services: [],
      avatarUrl: service.currentUser().avatarUrl,
      bannerGradient: 'from-blue-600 to-indigo-700',
      isAvailable: true
    });

    expect(service.currentUser().hasStore).toBe(true);
    expect(service.userStores().length).toBe(1);
    expect(service.currentUser().stores?.length).toBe(1);

    // Create 2nd store for the same user
    const store2 = service.createStore({
      ownerName: service.currentUser().name,
      storeName: 'Aman Second Design Store',
      tagline: 'Brand design and logos',
      category: 'Graphics & Design',
      skills: ['Figma', 'Illustrator'],
      experienceYears: 3,
      hourlyRate: 750,
      startingPrice: 400,
      area: 'Indiranagar',
      city: 'Bengaluru',
      distanceKm: 0.2,
      serviceRadiusKm: 10,
      socialMediaLinks: [{ id: 'sm-2', name: 'Behance', url: 'https://behance.net/test' }],
      description: 'Design and branding studio',
      services: [],
      avatarUrl: service.currentUser().avatarUrl,
      bannerGradient: 'from-purple-600 to-pink-500',
      isAvailable: true
    });

    // 1 user now has 2 distinct stores!
    expect(service.userStores().length).toBe(2);
    expect(service.currentUser().stores?.length).toBe(2);
    const storeIds = service.userStores().map(s => s.id);
    expect(storeIds).toContain(store1.id);
    expect(storeIds).toContain(store2.id);

    // Update store 1 specifically
    service.updateStore({ hourlyRate: 800 }, store1.id);
    expect(service.getStoreById(store1.id)?.hourlyRate).toBe(800);
    expect(service.getStoreById(store2.id)?.hourlyRate).toBe(750); // store 2 remains unchanged!

    // Toggle availability of store 2 specifically
    service.toggleStoreAvailability(store2.id);
    expect(service.getStoreById(store2.id)?.isAvailable).toBe(false);
    expect(service.getStoreById(store1.id)?.isAvailable).toBe(true); // store 1 remains active!

    // Delete store 1
    service.deleteStore(store1.id);
    expect(service.userStores().length).toBe(1);
    expect(service.getStoreById(store1.id)).toBeUndefined();
    expect(service.getStoreById(store2.id)).toBeDefined();
    expect(service.currentUser().hasStore).toBe(true);

    // Delete store 2 (last remaining store)
    service.deleteStore(store2.id);
    expect(service.userStores().length).toBe(0);
    expect(service.currentUser().hasStore).toBe(false);
    expect(service.currentUser().store).toBeUndefined();
  });

  it('should resolve stores by id via getStoreById', () => {
    const store1 = service.getStoreById('store-1');
    expect(store1).toBeDefined();
    expect(store1?.id).toBe('store-1');
    expect(store1?.storeName).toBe('PixelCraft Studios');

    const store2 = service.getStoreById('store-2');
    expect(store2).toBeDefined();
    expect(store2?.id).toBe('store-2');
    expect(store2?.storeName).toBe('CodeSpark Lab');

    const unknown = service.getStoreById('non-existent-id');
    expect(unknown).toBeUndefined();
  });

  describe('Store-Level View Count & Engagement (Daily, Weekly, Monthly, Lifetime)', () => {
    it('should initialize stores with views breakdown (daily, weekly, monthly, lifetime)', () => {
      const stores = service.stores();
      expect(stores.length).toBeGreaterThan(0);

      for (const store of stores) {
        expect(store.views).toBeDefined();
        expect(store.views?.daily).toBeGreaterThanOrEqual(0);
        expect(store.views?.weekly).toBeGreaterThanOrEqual(store.views?.daily || 0);
        expect(store.views?.monthly).toBeGreaterThanOrEqual(store.views?.weekly || 0);
        expect(store.views?.lifetime).toBeGreaterThanOrEqual(store.views?.monthly || 0);
      }
    });

    it('should record store view and increment daily, weekly, monthly, and lifetime counts', () => {
      const storeId = 'store-1';
      const beforeViews = service.getStoreViews(storeId);
      const initialDaily = beforeViews.daily;
      const initialWeekly = beforeViews.weekly;
      const initialMonthly = beforeViews.monthly;
      const initialLifetime = beforeViews.lifetime;

      service.recordStoreView(storeId, 'test-viewer-123');

      const afterViews = service.getStoreViews(storeId);
      expect(afterViews.daily).toBe(initialDaily + 1);
      expect(afterViews.weekly).toBe(initialWeekly + 1);
      expect(afterViews.monthly).toBe(initialMonthly + 1);
      expect(afterViews.lifetime).toBe(initialLifetime + 1);

      const store = service.getStoreById(storeId);
      expect(store?.viewHistory).toBeDefined();
      expect(store?.viewHistory?.length).toBeGreaterThan(0);
      expect(store?.viewHistory?.[0].viewerId).toBe('test-viewer-123');
      expect(store?.viewHistory?.[0].storeId).toBe(storeId);
      expect(store?.viewHistory?.[0].timestamp).toBeTruthy();
    });

    it('should retrieve engagement view count accurately based on selected type', () => {
      const storeId = 'store-2';
      const views = service.getStoreViews(storeId);

      expect(service.getStoreEngagement(storeId, 'daily')).toBe(views.daily);
      expect(service.getStoreEngagement(storeId, 'weekly')).toBe(views.weekly);
      expect(service.getStoreEngagement(storeId, 'monthly')).toBe(views.monthly);
      expect(service.getStoreEngagement(storeId, 'lifetime')).toBe(views.lifetime);
    });

    it('should initialize view count and record when creating a new store', () => {
      const newStore = service.createStore({
        ownerName: 'Test Owner',
        storeName: 'Test Engagement Store',
        tagline: 'Store for analytics test',
        category: 'Web & Tech',
        skills: ['Angular'],
        experienceYears: 1,
        hourlyRate: 500,
        startingPrice: 300,
        area: 'Indiranagar',
        city: 'Bengaluru',
        distanceKm: 0.5,
        serviceRadiusKm: 5,
        socialMediaLinks: [],
        description: 'Testing store view counts',
        services: [],
        avatarUrl: 'https://example.com/avatar.jpg',
        bannerGradient: 'from-blue-600 to-indigo-700',
        isAvailable: true
      });

      expect(newStore.views).toBeDefined();
      expect(newStore.views?.daily).toBe(1);
      expect(newStore.views?.weekly).toBe(1);
      expect(newStore.views?.monthly).toBe(1);
      expect(newStore.views?.lifetime).toBe(1);
      expect(newStore.viewHistory?.length).toBe(1);
    });

    it('should track view counts independently at store level for multi-store owners', () => {
      const store1 = service.createStore({
        ownerName: 'Owner Multi',
        storeName: 'Multi Store 1',
        tagline: 'Store 1',
        category: 'Web & Tech',
        skills: [],
        experienceYears: 1,
        hourlyRate: 500,
        startingPrice: 300,
        area: 'Indiranagar',
        city: 'Bengaluru',
        distanceKm: 0.5,
        serviceRadiusKm: 5,
        socialMediaLinks: [],
        description: '',
        services: [],
        avatarUrl: '',
        bannerGradient: 'from-blue-600 to-indigo-700',
        isAvailable: true
      });

      const store2 = service.createStore({
        ownerName: 'Owner Multi',
        storeName: 'Multi Store 2',
        tagline: 'Store 2',
        category: 'Graphics & Design',
        skills: [],
        experienceYears: 1,
        hourlyRate: 600,
        startingPrice: 400,
        area: 'Indiranagar',
        city: 'Bengaluru',
        distanceKm: 0.5,
        serviceRadiusKm: 5,
        socialMediaLinks: [],
        description: '',
        services: [],
        avatarUrl: '',
        bannerGradient: 'from-purple-600 to-pink-500',
        isAvailable: true
      });

      const userStores = service.userStores();
      expect(userStores.length).toBe(2);

      const storeAId = store1.id;
      const storeBId = store2.id;

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

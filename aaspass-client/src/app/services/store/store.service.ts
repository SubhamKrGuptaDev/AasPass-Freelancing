import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BackendStoreResponse } from '../../models/response.model';
import {
  StoreProfile,
  StoreReview,
  StoreSocialMediaLinks,
  UserSocialMediaLinks,
  normalizeSocialLinks,
  toStoreSocialMediaLinks,
  toUserSocialMediaLinks,
  EngagementViewType,
  StoreEngagementStats,
  StoreViewRecord,
  getStoreViews,
  getEngagementCount
} from '../../models/store.model';
import { UserProfile, getRandomAvatarUrl } from '../../models/user.model';
import { AuthService } from '../auth/auth.service';
import { StoreHttpService } from './store-http.service';

export const EMPTY_USER_PROFILE: UserProfile = {
  id: '',
  name: '',
  username: '',
  email: '',
  phone: '',
  avatarUrl: '',
  city: 'Bengaluru',
  area: '',
  country: 'India',
  bio: '',
  memberSince: '',
  hasStore: false,
  stores: [],
  creationDateTime: '',
  lastUpdateDateTime: ''
};

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  readonly authService = inject(AuthService);
  private storeHttpService = inject(StoreHttpService);

  // Current user (Option A: Unified Account), derived from AuthService - the single source of truth.
  // Guests see EMPTY_USER_PROFILE; changes go through patchCurrentUser() -> authService.setCurrentUser().
  readonly currentUser = computed<UserProfile>(() => this.authService.currentUser() ?? EMPTY_USER_PROFILE);

  // User's owned stores (Option A: 1 user can have multiple stores)
  readonly userStores = computed(() => {
    const currentUserId = this.currentUser().id;
    const fromMaster = this.stores().filter(s => s.userId === currentUserId);
    if (fromMaster.length > 0) return fromMaster;
    const user = this.currentUser();
    if (user.stores && user.stores.length > 0) return user.stores;
    if (user.store) return [user.store];
    return [];
  });

  constructor() {
    this.loadStoresFromApi();
  }

  /** Applies a change to the signed-in user via AuthService; a no-op for guests. */
  private patchCurrentUser(change: (user: UserProfile) => UserProfile): void {
    const user = this.authService.currentUser();
    if (user) {
      this.authService.setCurrentUser(change(user));
    }
  }

  // Master list of available nearby stores / freelancers loaded dynamically from backend API
  readonly stores = signal<StoreProfile[]>([]);
  readonly isLoading = signal<boolean>(false);

  // Load stores from Spring Boot REST API via StoreHttpService: GET /api/stores
  loadStoresFromApi(): void {
    this.isLoading.set(true);
    this.storeHttpService.getAllStores().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res && res.data && Array.isArray(res.data)) {
          const mapped = res.data.map(s => this.mapBackendStoreToProfile(s));
          this.stores.set(mapped);
        } else {
          this.stores.set([]);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.stores.set([]);
      }
    });
  }

  // Map backend StoreResponse DTO to StoreProfile
  mapBackendStoreToProfile(s: BackendStoreResponse): StoreProfile {
    if (!s) {
      return {
        id: '',
        userId: '',
        ownerName: '',
        storeName: '',
        tagline: '',
        category: '',
        skills: [],
        experienceYears: 0,
        hourlyRate: 0,
        startingPrice: 0,
        area: '',
        city: '',
        distanceKm: 0.5,
        serviceRadiusKm: 10,
        socialMediaLinks: [],
        description: '',
        services: [],
        rating: 5.0,
        reviewCount: 0,
        reviews: [],
        views: { daily: 0, weekly: 0, monthly: 0, lifetime: 0 },
        avatarUrl: getRandomAvatarUrl('store'),
        bannerGradient: 'from-indigo-500 to-purple-600',
        isAvailable: true,
        memberSince: '',
        creationDateTime: '',
        lastUpdateDateTime: ''
      };
    }

    return {
      id: String(s.id ?? ''),
      userId: String(s.userId ?? ''),
      ownerName: s.ownerName || '',
      storeName: s.storeName || '',
      tagline: s.tagline || '',
      category: s.category || '',
      skills: s.skills || [],
      experienceYears: s.experienceYears || 0,
      hourlyRate: s.hourlyRate || 0,
      startingPrice: s.startingPrice || 0,
      area: s.area || '',
      city: s.city || '',
      distanceKm: s.distanceKm || 0.5,
      serviceRadiusKm: s.serviceRadiusKm || 10,
      socialMediaLinks: (s.socialMediaLinks || []).filter(Boolean).map(l => ({ id: String(l.id || l.name || 'link'), name: l.name || '', url: l.url || '' })),
      storeSocialMediaLinks: s.storeSocialMediaLinks,
      userSocialLinks: s.storeSocialMediaLinks,
      description: s.description || '',
      services: (s.services || []).filter(Boolean).map(sv => ({
        id: String(sv.id ?? 'service'),
        name: sv.name || '',
        price: sv.price || 0,
        duration: sv.duration || '',
        description: sv.description || ''
      })),
      rating: s.rating || 5.0,
      reviewCount: s.reviewCount || 0,
      reviews: (s.reviews || []).filter(Boolean).map(r => ({
        id: String(r.id ?? 'rev'),
        storeId: String(s.id ?? ''),
        userName: r.userName || 'Anonymous',
        rating: r.rating || 5.0,
        message: r.message || '',
        date: r.reviewDate || 'Recently'
      })),
      views: {
        daily: s.views?.daily ?? 0,
        weekly: s.views?.weekly ?? 0,
        monthly: s.views?.monthly ?? 0,
        lifetime: s.views?.lifetime ?? 0
      },
      avatarUrl: (s.avatarUrl && s.avatarUrl.trim()) ? s.avatarUrl.trim() : getRandomAvatarUrl(s.storeName || s.ownerName),
      bannerGradient: s.bannerGradient || 'from-indigo-500 to-purple-600',
      isAvailable: s.isAvailable !== false,
      memberSince: s.memberSince || 'March 2026',
      creationDateTime: s.creationDateTime || new Date().toISOString(),
      lastUpdateDateTime: s.lastUpdateDateTime || new Date().toISOString()
    };
  }

  // Filter signals
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('All');
  readonly selectedMaxDistanceKm = signal<number>(50);
  readonly selectedCity = signal<string>('Bengaluru');

  // Categories list
  readonly categories = [
    'All',
    'Video & Editing',
    'Web & Tech',
    'Photography',
    'Tutoring & Education',
    'Graphics & Design',
    'Tech Support & Hardware'
  ];

  // Available cities for selection
  readonly availableCities = ['Bengaluru', 'Delhi NCR', 'Mumbai', 'Pune', 'Hyderabad'];

  // Available countries for selection
  readonly availableCountries = [
    'India',
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'United Arab Emirates',
    'Singapore'
  ];

  // Reactive filtered stores
  readonly filteredStores = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();
    const city = this.selectedCity().toLowerCase();

    return this.stores().filter(store => {
      // City check
      if (store.city.toLowerCase() !== city) {
        return false;
      }

      // Category check
      if (cat !== 'All' && store.category !== cat) {
        return false;
      }

      // Text query check
      if (query) {
        const matchesName = store.storeName.toLowerCase().includes(query) || store.ownerName.toLowerCase().includes(query);
        const matchesTagline = store.tagline.toLowerCase().includes(query);
        const matchesSkills = store.skills.some(skill => skill.toLowerCase().includes(query));
        const matchesArea = store.area.toLowerCase().includes(query);
        const matchesCategory = store.category.toLowerCase().includes(query);
        return matchesName || matchesTagline || matchesSkills || matchesArea || matchesCategory;
      }

      return true;
    });
  });

  // Fetch single store from Spring Boot REST API via StoreHttpService: GET /api/stores/{id}
  fetchStoreById(id: string): void {
    if (!id) return;
    const numId = parseInt(String(id).replace(/\D/g, '') || id, 10);
    if (isNaN(numId)) return;
    this.storeHttpService.getStoreById(numId).subscribe({
      next: (res) => {
        if (res && res.data) {
          const profile = this.mapBackendStoreToProfile(res.data);
          this.stores.update(list => {
            const exists = list.some(s => String(s.id) === String(profile.id));
            return exists ? list.map(s => String(s.id) === String(profile.id) ? profile : s) : [profile, ...list];
          });
        }
      },
      error: () => {}
    });
  }

  // URL segment for a store page: "<store-name>-<id>" (e.g. "subhams-plumbing-12").
  // The trailing ID keeps it unique even when store names repeat; the name part is only for readability.
  getStoreUrlKey(store: StoreProfile | undefined | null): string {
    const id = String(store?.id ?? '');
    // Unsaved local stores have non-numeric client IDs, which cannot be parsed back from a name-id key
    if (!/^\d+$/.test(id)) return id;
    const nameSlug = (store?.storeName ?? '')
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/'/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return nameSlug ? `${nameSlug}-${id}` : id;
  }

  // Resolve a store from a /stores/{key} URL segment. Accepts "<name>-<id>", a bare "<id>" (old links),
  // or an unsaved local store ID. Only the trailing ID is used for lookup, so renamed stores still resolve.
  getStoreByUrlKey(key: string): StoreProfile | undefined {
    if (!key) return undefined;
    // Exact ID match first, so local IDs like "store-3-1234" are not misread as numeric ID 1234
    const user = this.currentUser();
    const exactMatch = this.stores().find(s => String(s.id) === key)
      ?? (user.stores || []).find(s => String(s.id) === key);
    if (exactMatch) return exactMatch;

    const idMatch = key.match(/(?:^|-)(\d+)$/);
    return idMatch ? this.getStoreById(idMatch[1]) : undefined;
  }

  // Get single store by ID (searches loaded stores, user stores, and triggers dynamic API fetch if not present)
  getStoreById(id: string): StoreProfile | undefined {
    if (!id) return undefined;
    const fromMaster = this.stores().find(s => String(s.id) === String(id));
    if (fromMaster) return fromMaster;

    const user = this.currentUser();
    const fromUserStores = (user.stores || []).find(s => String(s.id) === String(id));
    if (fromUserStores) return fromUserStores;

    if (user.store && String(user.store.id) === String(id)) {
      return user.store;
    }

    this.fetchStoreById(id);
    return undefined;
  }

  // Helper to reliably resolve the correct numeric database User ID (for Demo accounts and active DB users)
  getNumericUserId(user?: UserProfile): number {
    const u = user || this.currentUser();
    if (!u) return 1;
    const username = (u.username || '').toLowerCase();
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    if (username === 'aman' || name.includes('aman') || email.includes('aman') || u.id === 'user-001' || u.id === '1') return 1;
    if (username === 'priya' || name.includes('priya') || email.includes('priya') || u.id === 'user-101' || u.id === '2') return 2;
    if (username === 'rohan' || name.includes('rohan') || email.includes('rohan') || u.id === 'user-102' || u.id === '3') return 3;
    const rawId = String(u.id ?? '').trim();
    const digits = rawId.replace(/\D/g, '');
    if (digits) {
      const parsed = parseInt(digits, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 1;
  }

  // Create a new store (Option A: transforms regular user into a store owner or adds an additional store)
  // Returns an Observable of StoreProfile (with store properties merged for full backward compatibility)
  createStore(storeData: Omit<StoreProfile, 'id' | 'userId' | 'rating' | 'reviewCount' | 'memberSince' | 'creationDateTime' | 'lastUpdateDateTime'> & Partial<Pick<StoreProfile, 'creationDateTime' | 'lastUpdateDateTime'>>): Observable<StoreProfile> & StoreProfile {
    const user = this.currentUser();
    const newStoreId = 'store-' + (this.stores().length + 1) + '-' + Math.random().toString(36).substring(2, 6);
    const nowIso = new Date().toISOString();

    const initialReview: StoreReview = {
      id: 'rev-welcome-' + Date.now(),
      storeId: newStoreId,
      userName: 'AasPass Community Member',
      rating: 5.0,
      message: 'Welcome to the AasPass neighborhood network! Your store is live and ready to receive client ratings and gigs.',
      date: 'Just now'
    };

    const initialViews: StoreEngagementStats = storeData.views || {
      daily: 1,
      weekly: 1,
      monthly: 1,
      lifetime: 1
    };
    const initialViewRecord: StoreViewRecord = {
      id: 'view-init-' + Date.now(),
      storeId: newStoreId,
      timestamp: nowIso,
      viewerId: user.id
    };

    const storeSocialLinks = storeData.storeSocialMediaLinks || (storeData.socialMediaLinks ? toStoreSocialMediaLinks(storeData.socialMediaLinks) : storeData.userSocialLinks);
    const newStore: StoreProfile = {
      ...storeData,
      storeSocialMediaLinks: storeSocialLinks,
      userSocialLinks: storeSocialLinks,
      socialMediaLinks: normalizeSocialLinks(storeData.socialMediaLinks, storeSocialLinks),
      id: newStoreId,
      userId: user.id,
      rating: 5.0,
      reviewCount: 1,
      reviews: [initialReview],
      views: initialViews,
      viewHistory: storeData.viewHistory || [initialViewRecord],
      memberSince: 'Just now',
      creationDateTime: storeData.creationDateTime || nowIso,
      lastUpdateDateTime: storeData.lastUpdateDateTime || nowIso
    };

    // Prepare clean payload for Spring Boot REST API: POST /api/stores
    // Filter out client temporary string IDs (like 'sm-init-1', 's-initial-1') so Jackson deserializes cleanly
    const cleanSocialLinks = (newStore.socialMediaLinks || [])
      .filter(l => Boolean(l && l.name && l.name.trim() && l.url && l.url.trim()))
      .map(l => ({
        name: l.name.trim(),
        url: l.url.trim()
      }));

    const cleanServices = (newStore.services || [])
      .filter(s => Boolean(s && s.name && s.name.trim()))
      .map(s => ({
        name: s.name.trim(),
        price: Number(s.price) || 0,
        duration: s.duration || '',
        description: s.description || ''
      }));

    const payload = {
      storeName: newStore.storeName.trim(),
      ownerName: (newStore.ownerName || user.name || 'Store Owner').trim(),
      tagline: newStore.tagline ? newStore.tagline.trim() : '',
      category: newStore.category.trim(),
      skills: newStore.skills || [],
      experienceYears: Number(newStore.experienceYears) || 0,
      hourlyRate: Number(newStore.hourlyRate) || 0,
      startingPrice: Number(newStore.startingPrice) || 0,
      area: newStore.area.trim(),
      city: newStore.city.trim(),
      serviceRadiusKm: Number(newStore.serviceRadiusKm) || 10,
      description: newStore.description || '',
      avatarUrl: (newStore.avatarUrl && newStore.avatarUrl.trim()) ? newStore.avatarUrl.trim() : (user.avatarUrl || ''),
      bannerGradient: newStore.bannerGradient || 'from-indigo-600 via-purple-600 to-pink-500',
      storeSocialMediaLinks: newStore.storeSocialMediaLinks,
      socialMediaLinks: cleanSocialLinks,
      services: cleanServices
    };

    const request$ = this.storeHttpService.createStore(payload).pipe(
      map(res => {
        if (!res || !res.data) {
          throw new Error(res?.message || 'Failed to create store in database');
        }
        const backendMapped = this.mapBackendStoreToProfile(res.data);

        // Update master stores signal list with the real persisted store
        this.stores.update(list => [
          backendMapped,
          ...list.filter(s => String(s.id) !== String(backendMapped.id) && s.id !== newStoreId)
        ]);

        // Update the signed-in user so the navbar and profile pick up the new store
        this.patchCurrentUser(u => {
          const existingStores = u.stores || (u.store ? [u.store] : []);
          const updatedStores = [
            backendMapped,
            ...existingStores.filter(s => String(s.id) !== String(backendMapped.id) && s.id !== newStoreId)
          ];
          const updatedUser: UserProfile = {
            ...u,
            hasStore: true,
            store: backendMapped,
            stores: updatedStores,
            lastUpdateDateTime: nowIso
          };
          return updatedUser;
        });

        return backendMapped;
      })
    );

    // Merge newStore properties onto the observable for backward compatibility with synchronous callers/tests
    return Object.assign(request$, newStore);
  }

  // Add customer review for a store owner (rating bounded between 1.0 and 5.0)
  addReview(storeId: string, reviewData: { userName: string; rating: number; message: string }): StoreReview {
    const rawRating = Number(reviewData.rating);
    // Enforce 1.0 min and 5.0 max
    const clampedRating = Math.max(1.0, Math.min(5.0, isNaN(rawRating) ? 5.0 : Math.round(rawRating * 10) / 10));

    const newReview: StoreReview = {
      id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      storeId,
      userName: reviewData.userName.trim() || 'Verified Neighbor',
      rating: clampedRating,
      message: reviewData.message.trim(),
      date: 'Just now'
    };

    this.stores.update(list => list.map(store => {
      if (store.id !== storeId) return store;
      const existingReviews = store.reviews || [];
      const updatedReviews = [newReview, ...existingReviews];
      const totalScore = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Math.round((totalScore / updatedReviews.length) * 10) / 10;

      return {
        ...store,
        rating: Math.max(1.0, Math.min(5.0, avgRating)),
        reviewCount: updatedReviews.length,
        reviews: updatedReviews
      };
    }));

    // If this store belongs to the current user, update currentUser as well
    const user = this.currentUser();
    const userStoreIds = (user.stores || (user.store ? [user.store] : [])).map(s => s.id);
    if (userStoreIds.includes(storeId)) {
      const updatedStore = this.getStoreById(storeId);
      if (updatedStore) {
        this.patchCurrentUser(u => {
          const updatedStores = (u.stores || []).map(s => s.id === storeId ? updatedStore : s);
          return {
            ...u,
            store: u.store?.id === storeId ? updatedStore : u.store,
            stores: updatedStores
          };
        });
      }
    }

    // Call Spring Boot REST API via StoreHttpService: POST /api/stores/{storeId}/reviews
    const numId = parseInt(String(storeId ?? '').replace(/\D/g, '') || '1', 10);
    this.storeHttpService.addReview(numId, {
      userName: newReview.userName,
      userAvatar: this.currentUser().avatarUrl,
      rating: clampedRating,
      message: newReview.message
    }).subscribe({ error: () => {} });

    return newReview;
  }

  // Record view count at store level (increments daily, weekly, monthly, lifetime counters)
  recordStoreView(storeId: string, viewerId?: string): void {
    const nowIso = new Date().toISOString();
    const newRecord: StoreViewRecord = {
      id: 'view-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      storeId,
      timestamp: nowIso,
      viewerId: viewerId || 'guest'
    };

    // Ensure store exists in master stores signal list
    if (!this.stores().some(s => s.id === storeId)) {
      const fallbackStore = this.getStoreById(storeId);
      if (fallbackStore) {
        this.stores.update(list => [fallbackStore, ...list]);
      }
    }

    this.stores.update(list => list.map(store => {
      if (store.id !== storeId) return store;
      const currentViews = getStoreViews(store);
      const updatedViews: StoreEngagementStats = {
        daily: (currentViews.daily || 0) + 1,
        weekly: (currentViews.weekly || 0) + 1,
        monthly: (currentViews.monthly || 0) + 1,
        lifetime: (currentViews.lifetime || 0) + 1
      };
      const history = store.viewHistory ? [newRecord, ...store.viewHistory] : [newRecord];

      return {
        ...store,
        views: updatedViews,
        viewHistory: history,
        lastUpdateDateTime: nowIso
      };
    }));

    // If this store belongs to the current user, update currentUser as well
    const user = this.currentUser();
    const userStoreIds = (user.stores || (user.store ? [user.store] : [])).map(s => s.id);
    if (userStoreIds.includes(storeId)) {
      const updatedStore = this.getStoreById(storeId);
      if (updatedStore) {
        this.patchCurrentUser(u => {
          const updatedStores = (u.stores || []).map(s => s.id === storeId ? updatedStore : s);
          return {
            ...u,
            store: u.store?.id === storeId ? updatedStore : u.store,
            stores: updatedStores
          };
        });
      }
    }

    // Call Spring Boot REST API via StoreHttpService: POST /api/stores/{id}/views
    const numId = parseInt(String(storeId ?? '').replace(/\D/g, '') || '1', 10);
    this.storeHttpService.recordStoreView(numId, viewerId).subscribe({ error: () => {} });
  }

  // Get view metrics for a specific store
  getStoreViews(storeId: string): StoreEngagementStats {
    const store = this.getStoreById(storeId);
    return getStoreViews(store);
  }

  // Get specific engagement count by type: 'daily' | 'weekly' | 'monthly' | 'lifetime'
  getStoreEngagement(storeId: string, type: EngagementViewType): number {
    const store = this.getStoreById(storeId);
    return getEngagementCount(store, type);
  }

  // Update existing store details (supports optional storeId to update specific store)
  updateStore(updated: Partial<StoreProfile>, storeId?: string): Observable<StoreProfile> {
    const user = this.currentUser();
    const targetStoreId = storeId || user.store?.id || (user.stores && user.stores.length > 0 ? user.stores[0].id : undefined);
    if (!targetStoreId) {
      return throwError(() => new Error('Target store ID not found for update'));
    }

    const nowIso = new Date().toISOString();

    // Ensure store exists in master stores signal list
    if (!this.stores().some(s => s.id === targetStoreId)) {
      const fallbackStore = this.getStoreById(targetStoreId);
      if (fallbackStore) {
        this.stores.update(list => [fallbackStore, ...list]);
      }
    }

    this.stores.update(list => list.map(s => {
      if (s.id !== targetStoreId) return s;
      const mergedLinks = updated.storeSocialMediaLinks || updated.userSocialLinks || (updated.socialMediaLinks ? toStoreSocialMediaLinks(updated.socialMediaLinks) : s.storeSocialMediaLinks || s.userSocialLinks);
      return {
        ...s,
        ...updated,
        storeSocialMediaLinks: mergedLinks,
        userSocialLinks: mergedLinks,
        socialMediaLinks: updated.socialMediaLinks
          ? normalizeSocialLinks(updated.socialMediaLinks, mergedLinks)
          : (mergedLinks ? normalizeSocialLinks(s.socialMediaLinks, mergedLinks) : s.socialMediaLinks),
        lastUpdateDateTime: nowIso
      };
    }));

    const updatedStore = this.getStoreById(targetStoreId);
    if (!updatedStore) {
      return throwError(() => new Error('Store profile could not be resolved'));
    }

    this.patchCurrentUser(u => {
      const currentStores = u.stores || (u.store ? [u.store] : []);
      const existsInUser = currentStores.some(s => s.id === targetStoreId);
      const updatedStores = existsInUser
        ? currentStores.map(s => s.id === targetStoreId ? updatedStore : s)
        : [updatedStore, ...currentStores];
      const isPrimary = u.store?.id === targetStoreId || !u.store;
      const updatedUser: UserProfile = {
        ...u,
        hasStore: true,
        store: isPrimary ? updatedStore : u.store,
        stores: updatedStores,
        lastUpdateDateTime: nowIso
      };
      return updatedUser;
    });

    // Clean dynamic social links for Spring REST API (strip client string IDs)
    const cleanSocialLinks = (updated.socialMediaLinks || updatedStore.socialMediaLinks || [])
      .filter(l => Boolean(l && l.name && l.name.trim() && l.url && l.url.trim()))
      .map(l => ({
        name: l.name.trim(),
        url: l.url.trim()
      }));

    // Call Spring Boot REST API via StoreHttpService: PUT /api/stores/{id}
    const numId = parseInt(String(targetStoreId ?? '').replace(/\D/g, '') || '1', 10);
    return this.storeHttpService.updateStore(numId, {
      storeName: updated.storeName || updatedStore.storeName,
      ownerName: updated.ownerName || updatedStore.ownerName,
      tagline: updated.tagline !== undefined ? updated.tagline : updatedStore.tagline,
      category: updated.category || updatedStore.category,
      skills: updated.skills || updatedStore.skills,
      experienceYears: updated.experienceYears !== undefined ? updated.experienceYears : updatedStore.experienceYears,
      hourlyRate: updated.hourlyRate !== undefined ? updated.hourlyRate : updatedStore.hourlyRate,
      startingPrice: updated.startingPrice !== undefined ? updated.startingPrice : updatedStore.startingPrice,
      area: updated.area || updatedStore.area,
      city: updated.city || updatedStore.city,
      serviceRadiusKm: updated.serviceRadiusKm !== undefined ? updated.serviceRadiusKm : updatedStore.serviceRadiusKm,
      description: updated.description !== undefined ? updated.description : updatedStore.description,
      avatarUrl: updated.avatarUrl || updatedStore.avatarUrl,
      bannerGradient: updated.bannerGradient || updatedStore.bannerGradient,
      isAvailable: updated.isAvailable !== undefined ? updated.isAvailable : updatedStore.isAvailable,
      storeSocialMediaLinks: updated.storeSocialMediaLinks || updatedStore.storeSocialMediaLinks,
      socialMediaLinks: cleanSocialLinks
    }).pipe(
      map(res => {
        if (res && res.data) {
          const backendMapped = this.mapBackendStoreToProfile(res.data);
          this.stores.update(list => list.map(s => String(s.id) === String(targetStoreId) ? backendMapped : s));
          // Keep the user's session copy in sync too, so store links pick up the new name after a rename
          this.patchCurrentUser(u => {
            const syncedUser: UserProfile = {
              ...u,
              store: u.store && String(u.store.id) === String(targetStoreId) ? backendMapped : u.store,
              stores: (u.stores || []).map(s => String(s.id) === String(targetStoreId) ? backendMapped : s)
            };
            return syncedUser;
          });
          return backendMapped;
        }
        return updatedStore;
      })
    );
  }

  // Delete an existing store owned by user
  deleteStore(storeId: string): void {
    const nowIso = new Date().toISOString();
    this.stores.update(list => list.filter(s => s.id !== storeId));

    this.patchCurrentUser(u => {
      const currentStores = (u.stores || (u.store ? [u.store] : [])).filter(s => s.id !== storeId);
      const hasAny = currentStores.length > 0;
      return {
        ...u,
        hasStore: hasAny,
        store: hasAny ? currentStores[0] : undefined,
        stores: currentStores,
        lastUpdateDateTime: nowIso
      };
    });

    // Call Spring Boot REST API via StoreHttpService: DELETE /api/stores/{id}
    const numId = parseInt(String(storeId ?? '').replace(/\D/g, '') || '1', 10);
    this.storeHttpService.deleteStore(numId).subscribe({ error: () => {} });
  }

  // Update basic user profile with UserSocialMediaLinks
  updateUserProfile(updated: Partial<UserProfile>): void {
    const userSocialMediaLinks = updated.userSocialMediaLinks || (updated.socialMediaLinks ? toUserSocialMediaLinks(updated.socialMediaLinks) : undefined);
    const normalizedUserSocial = updated.socialMediaLinks
      ? normalizeSocialLinks(updated.socialMediaLinks, userSocialMediaLinks)
      : undefined;

    // Ensure user always has a valid avatar image, falling back to a random avatar if missing
    const currentAvatar = (updated.avatarUrl && updated.avatarUrl.trim())
      ? updated.avatarUrl.trim()
      : (this.currentUser().avatarUrl && this.currentUser().avatarUrl.trim()
          ? this.currentUser().avatarUrl
          : getRandomAvatarUrl(updated.name || this.currentUser().name));

    const finalUpdated: Partial<UserProfile> = {
      ...updated,
      avatarUrl: currentAvatar
    };

    // The signed-in user is replaced with the backend response (AuthService); nothing is applied optimistically.
    // Only keys that carry a value are sent, so omitted fields keep their current server value.
    const profileChanges: Partial<UserProfile> = { ...finalUpdated };
    if (normalizedUserSocial) {
      profileChanges.socialMediaLinks = normalizedUserSocial;
    }
    if (userSocialMediaLinks) {
      profileChanges.userSocialMediaLinks = userSocialMediaLinks;
      profileChanges.userSocialLinks = userSocialMediaLinks;
    }
    if (this.authService.isLoggedIn()) {
      this.authService.updateUserProfile(profileChanges).subscribe({
        error: () => {
          // Failures are surfaced as toasts by the error interceptor; the profile keeps the server state.
        }
      });
    }
  }

  // Toggle store active/available status for a specific store or default to active
  toggleStoreAvailability(storeId?: string): void {
    const user = this.currentUser();
    const targetStoreId = storeId || user.store?.id || (user.stores && user.stores.length > 0 ? user.stores[0].id : undefined);
    if (!targetStoreId) return;

    const targetStore = this.getStoreById(targetStoreId);
    if (!targetStore) return;

    this.updateStore({ isAvailable: !targetStore.isAvailable }, targetStoreId);
  }

  // Filter setters
  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
  }

  setSelectedCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  setSelectedDistance(dist: number): void {
    this.selectedMaxDistanceKm.set(dist);
  }

  setSelectedCity(city: string): void {
    this.selectedCity.set(city);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('All');
    this.selectedMaxDistanceKm.set(50);
  }
}

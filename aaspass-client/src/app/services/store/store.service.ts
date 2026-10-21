import { Injectable, computed, effect, inject, signal } from '@angular/core';
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
  email: '',
  phone: '',
  avatarUrl: '',
  city: 'Bengaluru',
  area: '',
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

  // Current user (Option A: Unified Account - only populated from authenticated session)
  readonly currentUser = signal<UserProfile>(this.authService.currentUser() || EMPTY_USER_PROFILE);

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
    const activeAuthUser = this.authService.currentUser();
    if (activeAuthUser) {
      this.currentUser.set(activeAuthUser);
    }

    effect(() => {
      const authUser = this.authService.currentUser();
      this.currentUser.set(authUser || EMPTY_USER_PROFILE);
    });

    this.loadStoresFromApi();
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
  readonly selectedMaxDistanceKm = signal<number>(10);
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

  // Reactive filtered stores
  readonly filteredStores = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();
    const maxDist = this.selectedMaxDistanceKm();
    const city = this.selectedCity().toLowerCase();

    return this.stores().filter(store => {
      // City check
      if (store.city.toLowerCase() !== city) {
        return false;
      }

      // Distance check
      if (maxDist < 50 && store.distanceKm > maxDist) {
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

  // Create a new store (Option A: transforms regular user into a store owner or adds an additional store)
  createStore(storeData: Omit<StoreProfile, 'id' | 'userId' | 'rating' | 'reviewCount' | 'memberSince' | 'creationDateTime' | 'lastUpdateDateTime'> & Partial<Pick<StoreProfile, 'creationDateTime' | 'lastUpdateDateTime'>>): StoreProfile {
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

    // Add to stores list
    this.stores.update(list => [newStore, ...list]);

    // Update user profile with the new store and ensure multi-store list contains it
    this.currentUser.update(u => {
      const existingStores = u.stores || (u.store ? [u.store] : []);
      const updatedStores = [newStore, ...existingStores.filter(s => s.id !== newStore.id)];
      return {
        ...u,
        hasStore: true,
        store: newStore,
        stores: updatedStores,
        lastUpdateDateTime: nowIso
      };
    });

    // Call Spring Boot REST API via StoreHttpService: POST /api/stores
    const payload = {
      userId: parseInt(String(user.id ?? '').replace(/\D/g, '') || '1', 10),
      storeName: newStore.storeName,
      ownerName: newStore.ownerName || user.name,
      tagline: newStore.tagline,
      category: newStore.category,
      skills: newStore.skills,
      experienceYears: newStore.experienceYears,
      hourlyRate: newStore.hourlyRate,
      startingPrice: newStore.startingPrice,
      area: newStore.area,
      city: newStore.city,
      serviceRadiusKm: newStore.serviceRadiusKm,
      description: newStore.description,
      avatarUrl: newStore.avatarUrl,
      bannerGradient: newStore.bannerGradient,
      storeSocialMediaLinks: newStore.storeSocialMediaLinks,
      socialMediaLinks: newStore.socialMediaLinks,
      services: newStore.services
    };

    this.storeHttpService.createStore(payload).subscribe({
      next: (res) => {
        if (res && res.data) {
          const backendMapped = this.mapBackendStoreToProfile(res.data);
          this.stores.update(list => list.map(s => s.id === newStoreId ? backendMapped : s));
          this.currentUser.update(u => ({
            ...u,
            hasStore: true,
            store: u.store?.id === newStoreId ? backendMapped : u.store,
            stores: (u.stores || []).map(s => s.id === newStoreId ? backendMapped : s)
          }));
        }
      },
      error: () => {}
    });

    return newStore;
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
        this.currentUser.update(u => {
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
        this.currentUser.update(u => {
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
  updateStore(updated: Partial<StoreProfile>, storeId?: string): void {
    const user = this.currentUser();
    const targetStoreId = storeId || user.store?.id || (user.stores && user.stores.length > 0 ? user.stores[0].id : undefined);
    if (!targetStoreId) return;

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
    if (!updatedStore) return;

    this.currentUser.update(u => {
      const currentStores = u.stores || (u.store ? [u.store] : []);
      const existsInUser = currentStores.some(s => s.id === targetStoreId);
      const updatedStores = existsInUser
        ? currentStores.map(s => s.id === targetStoreId ? updatedStore : s)
        : [updatedStore, ...currentStores];
      const isPrimary = u.store?.id === targetStoreId || !u.store;
      return {
        ...u,
        hasStore: true,
        store: isPrimary ? updatedStore : u.store,
        stores: updatedStores,
        lastUpdateDateTime: nowIso
      };
    });

    // Call Spring Boot REST API via StoreHttpService: PUT /api/stores/{id}
    const numId = parseInt(String(targetStoreId ?? '').replace(/\D/g, '') || '1', 10);
    this.storeHttpService.updateStore(numId, {
      storeName: updated.storeName,
      ownerName: updated.ownerName,
      tagline: updated.tagline,
      category: updated.category,
      skills: updated.skills,
      experienceYears: updated.experienceYears,
      hourlyRate: updated.hourlyRate,
      startingPrice: updated.startingPrice,
      area: updated.area,
      city: updated.city,
      serviceRadiusKm: updated.serviceRadiusKm,
      description: updated.description,
      avatarUrl: updated.avatarUrl,
      bannerGradient: updated.bannerGradient,
      isAvailable: updated.isAvailable,
      storeSocialMediaLinks: updated.storeSocialMediaLinks,
      socialMediaLinks: updated.socialMediaLinks
    }).subscribe({ error: () => {} });
  }

  // Delete an existing store owned by user
  deleteStore(storeId: string): void {
    const nowIso = new Date().toISOString();
    this.stores.update(list => list.filter(s => s.id !== storeId));

    this.currentUser.update(u => {
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

    this.currentUser.update(u => ({
      ...u,
      ...finalUpdated,
      socialMediaLinks: normalizedUserSocial ?? finalUpdated.socialMediaLinks ?? u.socialMediaLinks,
      userSocialMediaLinks: userSocialMediaLinks ?? finalUpdated.userSocialMediaLinks ?? u.userSocialMediaLinks,
      userSocialLinks: userSocialMediaLinks ?? finalUpdated.userSocialLinks ?? u.userSocialLinks,
      lastUpdateDateTime: new Date().toISOString()
    }));
    if (this.authService.isLoggedIn()) {
      this.authService.updateUserProfile(finalUpdated);
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
    this.selectedMaxDistanceKm.set(10);
  }
}

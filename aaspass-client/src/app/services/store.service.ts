import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  StoreProfile,
  StoreReview,
  normalizeSocialLinks,
  EngagementViewType,
  StoreEngagementStats,
  StoreViewRecord,
  getStoreViews,
  getEngagementCount
} from '../models/store.model';
import { UserProfile } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  readonly authService = inject(AuthService);

  // Current user (Option A: Unified Account)
  readonly currentUser = signal<UserProfile>({
    id: 'user-001',
    name: 'Aman Sharma',
    email: 'aman.sharma@example.com',
    phone: '+91 98765 43210',
    aadharNumber: 'XXXX-XXXX-8921',
    panNumber: 'ABCDE1234F',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    city: 'Bengaluru',
    area: 'Indiranagar',
    bio: 'Tech enthusiast and student exploring freelance gigs and local networking.',
    memberSince: 'March 2026',
    creationDateTime: '2026-03-01T10:00:00.000Z',
    lastUpdateDateTime: '2026-03-01T10:00:00.000Z',
    hasStore: false,
    store: undefined,
    stores: []
  });

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
      if (authUser) {
        this.currentUser.set(authUser);
      }
    });
  }

  // Master list of available nearby stores / freelancers
  readonly stores = signal<StoreProfile[]>([
    {
      id: 'store-1',
      userId: 'user-101',
      ownerName: 'Priya Nair',
      storeName: 'PixelCraft Studios',
      tagline: 'Short-form Reels, TikToks & YouTube Shorts Editor',
      category: 'Video & Editing',
      skills: ['Premiere Pro', 'CapCut', 'Color Grading', 'Sound Design', 'Motion Graphics'],
      experienceYears: 2,
      hourlyRate: 500,
      startingPrice: 350,
      area: 'Indiranagar',
      city: 'Bengaluru',
      distanceKm: 0.8,
      serviceRadiusKm: 6,
      socialMediaLinks: [
        { id: 'sm-1-1', name: 'Instagram', url: 'https://instagram.com/priya_edits' },
        { id: 'sm-1-2', name: 'LinkedIn', url: 'https://linkedin.com/in/priyanair' },
        { id: 'sm-1-3', name: 'Portfolio', url: 'https://priyacrafts.design' },
        { id: 'sm-1-4', name: 'YouTube', url: 'https://youtube.com/@priyaedits' }
      ],
      userSocialLinks: {
        instagram: 'https://instagram.com/priya_edits',
        linkedin: 'https://linkedin.com/in/priyanair',
        portfolio: 'https://priyacrafts.design',
        youtube: 'https://youtube.com/@priyaedits'
      },
      description: 'College student & passionate video editor specializing in fast-paced viral reels for local cafes, fashion brands, and personal creators. Can meet in person in Indiranagar/Koramangala.',
      services: [
        { id: 's1', name: '30-sec Instagram Reel / Short', price: 450, duration: '24 hrs', description: 'Includes captions, trending audio sync & color correction.' },
        { id: 's2', name: 'Pack of 5 Commercial Reels', price: 2000, duration: '3 days', description: 'Ideal for local restaurants, clothing stores, and fitness trainers.' },
        { id: 's3', name: 'YouTube Long-form Video Edit (10-15 min)', price: 1800, duration: '2 days', description: 'Complete pacing cut, sound effects, B-roll insertions.' }
      ],
      rating: 4.9,
      reviewCount: 38,
      reviews: [
        {
          id: 'rev-101',
          storeId: 'store-1',
          userName: 'Rahul Verma',
          rating: 5.0,
          message: 'Priya edited 3 Instagram reels for our cafe in Indiranagar. Pacing, hooks and audio transitions were super clean and delivered in under 24 hours!',
          date: '2 days ago'
        },
        {
          id: 'rev-102',
          storeId: 'store-1',
          userName: 'Sneha Patel',
          rating: 4.8,
          message: 'Great communication and fast turnaround. Very easy to meet in person to discuss video concepts over coffee.',
          date: '1 week ago'
        },
        {
          id: 'rev-103',
          storeId: 'store-1',
          userName: 'Arjun Das',
          rating: 4.9,
          message: 'Top-tier color grading and motion text. Highly recommend for any local creators who need urgent delivery.',
          date: '2 weeks ago'
        }
      ],
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      bannerGradient: 'from-pink-500 to-rose-600',
      isAvailable: true,
      views: { daily: 42, weekly: 285, monthly: 1140, lifetime: 3820 },
      memberSince: 'Jan 2026',
      creationDateTime: '2026-01-10T08:30:00.000Z',
      lastUpdateDateTime: '2026-03-12T14:20:00.000Z'
    },
    {
      id: 'store-2',
      userId: 'user-102',
      ownerName: 'Rohan Deshmukh',
      storeName: 'DevSprint Solutions',
      tagline: 'Modern Portfolio, Landing Pages & Shopify Stores',
      category: 'Web & Tech',
      skills: ['Angular', 'Next.js', 'Tailwind CSS', 'Shopify', 'WordPress'],
      experienceYears: 3,
      hourlyRate: 850,
      startingPrice: 2500,
      area: 'Domlur',
      city: 'Bengaluru',
      distanceKm: 2.1,
      serviceRadiusKm: 12,
      socialMediaLinks: [
        { id: 'sm-2-1', name: 'GitHub', url: 'https://github.com/rohandev' },
        { id: 'sm-2-2', name: 'LinkedIn', url: 'https://linkedin.com/in/rohandeshmukh' },
        { id: 'sm-2-3', name: 'Portfolio', url: 'https://rohansprint.dev' },
        { id: 'sm-2-4', name: 'Twitter / X', url: 'https://x.com/rohandev' }
      ],
      userSocialLinks: {
        github: 'https://github.com/rohandev',
        linkedin: 'https://linkedin.com/in/rohandeshmukh',
        portfolio: 'https://rohansprint.dev',
        twitter: 'https://x.com/rohandev'
      },
      description: 'Full-stack software engineer offering weekend web development and digital transformation for neighborhood businesses. Direct one-on-one consultation over coffee.',
      services: [
        { id: 's4', name: 'High-Converting Business Landing Page', price: 3500, duration: '3 days', description: 'Fast, responsive, SEO-ready single-page website.' },
        { id: 's5', name: 'E-commerce / Shopify Store Setup', price: 8000, duration: '1 week', description: 'Product catalogs, payment gateway integration, domain linking.' },
        { id: 's6', name: 'Hourly Tech Consulting / Bug Fixing', price: 850, duration: 'Hourly', description: 'Debug existing code, hosting migration, or speed optimization.' }
      ],
      rating: 4.8,
      reviewCount: 22,
      reviews: [
        {
          id: 'rev-201',
          storeId: 'store-2',
          userName: 'Kavita Sundaram',
          rating: 5.0,
          message: 'Rohan built a responsive landing page for our boutique. Met at Starbucks in Domlur to finalize specs.',
          date: '3 days ago'
        },
        {
          id: 'rev-202',
          storeId: 'store-2',
          userName: 'Sameer Khan',
          rating: 4.6,
          message: 'Fixed our Shopify checkout issues within a couple hours. Professional, fast and knowledgeable.',
          date: '2 weeks ago'
        }
      ],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      bannerGradient: 'from-blue-600 to-indigo-700',
      isAvailable: true,
      views: { daily: 28, weekly: 194, monthly: 810, lifetime: 2450 },
      memberSince: 'Feb 2026',
      creationDateTime: '2026-02-01T11:15:00.000Z',
      lastUpdateDateTime: '2026-03-14T09:45:00.000Z'
    },
    {
      id: 'store-3',
      userId: 'user-103',
      ownerName: 'Ananya Sen',
      storeName: 'Lens & Light Visuals',
      tagline: 'Event & Product Photographer | Natural Light Portraits',
      category: 'Photography',
      skills: ['Sony Alpha', 'Lightroom', 'Studio Lighting', 'Portraits', 'Product Shoots'],
      experienceYears: 4,
      hourlyRate: 1200,
      startingPrice: 1500,
      area: 'Koramangala',
      city: 'Bengaluru',
      distanceKm: 3.4,
      serviceRadiusKm: 15,
      socialMediaLinks: [
        { id: 'sm-3-1', name: 'Instagram', url: 'https://instagram.com/ananyas_lens' },
        { id: 'sm-3-2', name: 'Portfolio', url: 'https://ananyasen.photos' },
        { id: 'sm-3-3', name: 'Behance', url: 'https://behance.net/ananyasen' }
      ],
      userSocialLinks: {
        instagram: 'https://instagram.com/ananyas_lens',
        portfolio: 'https://ananyasen.photos'
      },
      description: 'Freelance photographer capturing candid events, graduation portraits, and restaurant food/product catalogs. Bring your brand or memories to life.',
      services: [
        { id: 's7', name: 'Personal Brand / LinkedIn Portrait Session', price: 1500, duration: '1 hour', description: '10 edited high-res photos taken at your preferred outdoor location.' },
        { id: 's8', name: 'Restaurant / Cafe Menu Shoot', price: 4000, duration: 'Half day', description: 'Full styling, 25 high-resolution dish photos ready for Swiggy/Zomato.' },
        { id: 's9', name: 'Small Birthday / Anniversary Coverage', price: 5000, duration: '3 hours', description: 'Unlimited raw photos + 40 curated edited snaps delivered in 48 hours.' }
      ],
      rating: 5.0,
      reviewCount: 46,
      reviews: [
        {
          id: 'rev-301',
          storeId: 'store-3',
          userName: 'Divya R.',
          rating: 5.0,
          message: 'Stunning menu photography! Our dishes look mouth-watering on Zomato now. Super cooperative and quick with edits.',
          date: 'Yesterday'
        },
        {
          id: 'rev-302',
          storeId: 'store-3',
          userName: 'Naveen Kumar',
          rating: 5.0,
          message: 'Ananya took candid photos at our anniversary party. The natural light shots were amazing!',
          date: '1 week ago'
        }
      ],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      bannerGradient: 'from-amber-500 to-orange-600',
      isAvailable: true,
      views: { daily: 35, weekly: 240, monthly: 980, lifetime: 2900 },
      memberSince: 'Nov 2025',
      creationDateTime: '2025-11-20T16:00:00.000Z',
      lastUpdateDateTime: '2026-03-15T12:00:00.000Z'
    },
    {
      id: 'store-4',
      userId: 'user-104',
      ownerName: 'Vikram Joshi',
      storeName: 'CodePrep Mentorship',
      tagline: 'Math, Science & Python Tutoring for High School & College',
      category: 'Tutoring & Education',
      skills: ['Python', 'Class 10/12 CBSE Math', 'Data Structures', 'IIT-JEE Prep'],
      experienceYears: 2,
      hourlyRate: 400,
      startingPrice: 400,
      area: 'HAL 2nd Stage',
      city: 'Bengaluru',
      distanceKm: 1.6,
      serviceRadiusKm: 5,
      socialMediaLinks: [
        { id: 'sm-4-1', name: 'LinkedIn', url: 'https://linkedin.com/in/vikram-joshi-tutor' },
        { id: 'sm-4-2', name: 'GitHub', url: 'https://github.com/vikramj-edu' }
      ],
      userSocialLinks: {
        linkedin: 'https://linkedin.com/in/vikram-joshi-tutor',
        github: 'https://github.com/vikramj-edu'
      },
      description: 'Final year engineering student offering home visits or online tutoring in mathematics, physics, and introductory programming.',
      services: [
        { id: 's10', name: '1-on-1 Class 11-12 Mathematics Session', price: 400, duration: '1 hour', description: 'Concept clarity, NCERT problems, and doubt resolution.' },
        { id: 's11', name: 'Python Basics for Beginners (4-Class Pack)', price: 1500, duration: '4 sessions', description: 'Hands-on coding, loops, data structures, small projects.' }
      ],
      rating: 4.9,
      reviewCount: 19,
      reviews: [
        {
          id: 'rev-401',
          storeId: 'store-4',
          userName: 'Meera Iyer',
          rating: 5.0,
          message: 'Explained Class 12 Calculus concepts so clearly. My daughter improved her test scores significantly.',
          date: '4 days ago'
        },
        {
          id: 'rev-402',
          storeId: 'store-4',
          userName: 'Aditya Gupta',
          rating: 4.8,
          message: 'Great mentor for Python basics. Gives practical exercises and helps debug patiently.',
          date: '2 weeks ago'
        }
      ],
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      bannerGradient: 'from-emerald-500 to-teal-700',
      isAvailable: true,
      views: { daily: 19, weekly: 130, monthly: 540, lifetime: 1680 },
      memberSince: 'Dec 2025',
      creationDateTime: '2025-12-05T13:45:00.000Z',
      lastUpdateDateTime: '2026-03-10T17:30:00.000Z'
    },
    {
      id: 'store-5',
      userId: 'user-105',
      ownerName: 'Neha Aggarwal',
      storeName: 'BrandCanvas Studio',
      tagline: 'Logos, Social Media Posters & Brand Identity',
      category: 'Graphics & Design',
      skills: ['Figma', 'Illustrator', 'Packaging Design', 'Typography', 'Canva Pro'],
      experienceYears: 3,
      hourlyRate: 650,
      startingPrice: 800,
      area: 'Old Airport Road',
      city: 'Bengaluru',
      distanceKm: 2.8,
      serviceRadiusKm: 10,
      socialMediaLinks: [
        { id: 'sm-5-1', name: 'Instagram', url: 'https://instagram.com/brandcanvas_neha' },
        { id: 'sm-5-2', name: 'Behance', url: 'https://behance.net/neha_brandcanvas' },
        { id: 'sm-5-3', name: 'Dribbble', url: 'https://dribbble.com/brandcanvas_neha' }
      ],
      userSocialLinks: {
        instagram: 'https://instagram.com/brandcanvas_neha',
        portfolio: 'https://behance.net/neha_brandcanvas'
      },
      description: 'Graphic designer helping local small businesses, home bakers, and startups look premium on a sensible budget.',
      services: [
        { id: 's12', name: 'Custom Logo + Color Palette', price: 1800, duration: '2 days', description: '3 initial concepts + unlimited revisions on chosen concept.' },
        { id: 's13', name: 'Social Media Post Template Pack (10 posts)', price: 1500, duration: '2 days', description: 'Editable Figma/Canva templates tailored to your brand style.' }
      ],
      rating: 4.7,
      reviewCount: 31,
      reviews: [
        {
          id: 'rev-501',
          storeId: 'store-5',
          userName: 'Pooja Hegde',
          rating: 4.8,
          message: 'Designed beautiful social media templates and logo for my bakery business. Very modern aesthetic!',
          date: '5 days ago'
        },
        {
          id: 'rev-502',
          storeId: 'store-5',
          userName: 'Karan Mehra',
          rating: 4.6,
          message: 'Creative graphic designer, gave multiple options to pick from.',
          date: '3 weeks ago'
        }
      ],
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
      bannerGradient: 'from-purple-600 to-violet-800',
      isAvailable: true,
      views: { daily: 51, weekly: 345, monthly: 1420, lifetime: 4120 },
      memberSince: 'Jan 2026',
      creationDateTime: '2026-01-18T10:20:00.000Z',
      lastUpdateDateTime: '2026-03-11T15:10:00.000Z'
    },
    {
      id: 'store-6',
      userId: 'user-106',
      ownerName: 'Karthik Rao',
      storeName: 'FixIt Geeks',
      tagline: 'Custom PC Builds, Laptop Upgrades & Home Wi-Fi Setup',
      category: 'Tech Support & Hardware',
      skills: ['PC Assembly', 'SSD Upgrade', 'Home Networking', 'Windows/Linux', 'Troubleshooting'],
      experienceYears: 5,
      hourlyRate: 450,
      startingPrice: 300,
      area: 'Ulsoor',
      city: 'Bengaluru',
      distanceKm: 3.9,
      serviceRadiusKm: 8,
      socialMediaLinks: [
        { id: 'sm-6-1', name: 'YouTube', url: 'https://youtube.com/@fixitgeeks' },
        { id: 'sm-6-2', name: 'Twitter / X', url: 'https://x.com/fixitgeeks' },
        { id: 'sm-6-3', name: 'LinkedIn', url: 'https://linkedin.com/in/karthik-rao-tech' }
      ],
      userSocialLinks: {
        youtube: 'https://youtube.com/@fixitgeeks',
        twitter: 'https://x.com/fixitgeeks',
        linkedin: 'https://linkedin.com/in/karthik-rao-tech'
      },
      description: 'Tech enthusiast offering on-site hardware diagnosis, gaming rig assembly, SSD/RAM upgrades, and mesh Wi-Fi optimization for work-from-home setups.',
      services: [
        { id: 's14', name: 'Laptop Deep Clean & Thermal Paste Replacement', price: 500, duration: '2 hours', description: 'Cooling overhaul for overheating gaming/work laptops.' },
        { id: 's15', name: 'Custom PC Rig Assembly & OS Setup', price: 1500, duration: 'Same day', description: 'Complete component assembly, clean cable management, BIOS configuration.' }
      ],
      rating: 4.9,
      reviewCount: 54,
      reviews: [
        {
          id: 'rev-601',
          storeId: 'store-6',
          userName: 'Siddharth Nair',
          rating: 5.0,
          message: 'Assembled my entire gaming rig and managed all cables cleanly. Boots in 5 seconds!',
          date: '3 days ago'
        },
        {
          id: 'rev-602',
          storeId: 'store-6',
          userName: 'Tanvi Shah',
          rating: 4.8,
          message: 'Upgraded SSD and thermal paste on my old laptop, running fast like new.',
          date: '1 week ago'
        }
      ],
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
      bannerGradient: 'from-cyan-600 to-blue-800',
      isAvailable: true,
      views: { daily: 33, weekly: 215, monthly: 890, lifetime: 2600 },
      memberSince: 'Oct 2025',
      creationDateTime: '2025-10-05T09:00:00.000Z',
      lastUpdateDateTime: '2026-03-13T11:25:00.000Z'
    }
  ]);

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

  // Get single store by ID (with fallback to user profile stores and demo presets)
  getStoreById(id: string): StoreProfile | undefined {
    const fromMaster = this.stores().find(s => s.id === id);
    if (fromMaster) return fromMaster;

    const user = this.currentUser();
    const fromUserStores = (user.stores || []).find(s => s.id === id);
    if (fromUserStores) return fromUserStores;

    if (user.store?.id === id) return user.store;

    if (id === 'store-user-001') {
      return this.buildDemoStore1();
    }
    if (id === 'store-user-002') {
      return this.buildDemoStore2();
    }

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

    const newStore: StoreProfile = {
      ...storeData,
      socialMediaLinks: normalizeSocialLinks(storeData.socialMediaLinks, storeData.userSocialLinks),
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

  // Helper to build first demo store
  buildDemoStore1(user?: UserProfile): StoreProfile {
    const u = user || this.currentUser();
    return {
      id: 'store-user-001',
      userId: u.id,
      ownerName: u.name,
      storeName: 'Aman Tech & Creative Studio',
      tagline: 'Modern Web Apps, Python Scripts & Tech Consulting',
      category: 'Web & Tech',
      skills: ['Angular', 'TypeScript', 'Python', 'Tailwind CSS', 'API Integration'],
      experienceYears: 2,
      hourlyRate: 650,
      startingPrice: 500,
      area: u.area,
      city: u.city,
      distanceKm: 0.1,
      serviceRadiusKm: 8,
      socialMediaLinks: [
        { id: 'sm-u-1', name: 'GitHub', url: 'https://github.com/amansharma' },
        { id: 'sm-u-2', name: 'LinkedIn', url: 'https://linkedin.com/in/amansharma' },
        { id: 'sm-u-3', name: 'Portfolio', url: 'https://amansharma.dev' },
        { id: 'sm-u-4', name: 'Instagram', url: 'https://instagram.com/aman_codes' }
      ],
      userSocialLinks: {
        github: 'https://github.com/amansharma',
        linkedin: 'https://linkedin.com/in/amansharma',
        portfolio: 'https://amansharma.dev',
        instagram: 'https://instagram.com/aman_codes'
      },
      description: 'Passionate developer offering quick frontend/backend solutions, web automations, and local tech support for startups and neighborhood businesses in Indiranagar.',
      services: [
        { id: 'usr-s1', name: 'Custom Landing Page / Web App Module', price: 2500, duration: '2 days', description: 'Fast, responsive website built with modern UI frameworks.' },
        { id: 'usr-s2', name: '1-on-1 Coding Mentorship / Bug Fix', price: 650, duration: 'Hourly', description: 'Hands-on debugging and code walkthrough.' }
      ],
      rating: 4.9,
      reviewCount: 3,
      reviews: [
        {
          id: 'rev-u1',
          storeId: 'store-user-001',
          userName: 'Ramesh Krishnan',
          rating: 5.0,
          message: 'Aman was super responsive and solved our web form issue within 3 hours. Great local talent in Indiranagar!',
          date: 'Yesterday'
        },
        {
          id: 'rev-u2',
          storeId: 'store-user-001',
          userName: 'Pooja Hegde',
          rating: 4.8,
          message: 'Very clear communication and delivered clean code on time. Highly recommended!',
          date: '3 days ago'
        },
        {
          id: 'rev-u3',
          storeId: 'store-user-001',
          userName: 'Kunal Kapoor',
          rating: 4.9,
          message: 'Met in Indiranagar to discuss requirements. Patient and knowledgeable with tech stacks.',
          date: '1 week ago'
        }
      ],
      avatarUrl: u.avatarUrl,
      bannerGradient: 'from-indigo-600 via-purple-600 to-pink-500',
      isAvailable: true,
      views: { daily: 18, weekly: 124, monthly: 480, lifetime: 1540 },
      memberSince: 'March 2026',
      creationDateTime: '2026-03-01T10:00:00.000Z',
      lastUpdateDateTime: '2026-03-15T18:30:00.000Z'
    };
  }

  // Helper to build second demo store
  buildDemoStore2(user?: UserProfile): StoreProfile {
    const u = user || this.currentUser();
    return {
      id: 'store-user-002',
      userId: u.id,
      ownerName: u.name,
      storeName: 'Aman Lens & Aerial Films',
      tagline: 'Drone Shoots, Cafe Ambience & Event Videography',
      category: 'Video & Editing',
      skills: ['DJI Drone', 'Sony FX3', 'DaVinci Resolve', 'Cinematic Grading', '4K Reels'],
      experienceYears: 3,
      hourlyRate: 900,
      startingPrice: 1200,
      area: u.area,
      city: u.city,
      distanceKm: 0.1,
      serviceRadiusKm: 15,
      socialMediaLinks: [
        { id: 'sm-u2-1', name: 'Instagram', url: 'https://instagram.com/aman_aerial' },
        { id: 'sm-u2-2', name: 'YouTube', url: 'https://youtube.com/@amanaerialfilms' },
        { id: 'sm-u2-3', name: 'Portfolio', url: 'https://amanaerial.film' }
      ],
      userSocialLinks: {
        instagram: 'https://instagram.com/aman_aerial',
        youtube: 'https://youtube.com/@amanaerialfilms',
        portfolio: 'https://amanaerial.film'
      },
      description: 'Certified drone pilot and videographer creating cinematic commercial reels, property walkthroughs, and cafe promos across Bengaluru.',
      services: [
        { id: 'usr2-s1', name: '4K Commercial Drone Reel (60s)', price: 3000, duration: '24 hours', description: 'High-res aerial footage with license, sound design & 4K color grade.' },
        { id: 'usr2-s2', name: 'Cafe / Restaurant Atmosphere Tour', price: 4500, duration: '2 days', description: 'Interior glide shots, patron ambience, and Swiggy/Zomato promotional clips.' }
      ],
      rating: 5.0,
      reviewCount: 2,
      reviews: [
        {
          id: 'rev-u2-1',
          storeId: 'store-user-002',
          userName: 'Deepa Srinivas',
          rating: 5.0,
          message: 'Incredible drone shots for our rooftop cafe launch in Indiranagar. The video hit 50k views on Instagram!',
          date: '3 days ago'
        },
        {
          id: 'rev-u2-2',
          storeId: 'store-user-002',
          userName: 'Vikram Seth',
          rating: 5.0,
          message: 'Very punctual and great cinematic eye. Delivered the finalized grade ahead of schedule.',
          date: '1 week ago'
        }
      ],
      avatarUrl: u.avatarUrl,
      bannerGradient: 'from-amber-500 via-rose-600 to-indigo-700',
      isAvailable: true,
      views: { daily: 12, weekly: 86, monthly: 320, lifetime: 890 },
      memberSince: 'March 2026',
      creationDateTime: '2026-03-05T14:00:00.000Z',
      lastUpdateDateTime: '2026-03-16T11:00:00.000Z'
    };
  }

  // Helper to toggle demo store for easy previewing of multiple stores and review section
  toggleDemoStore(): void {
    const user = this.currentUser();
    if (user.hasStore) {
      const demoIds = ['store-user-001', 'store-user-002'];
      this.stores.update(list => list.filter(s => !demoIds.includes(s.id)));
      this.currentUser.update(u => ({
        ...u,
        hasStore: false,
        store: undefined,
        stores: []
      }));
    } else {
      const demoStore1 = this.buildDemoStore1(user);
      const demoStore2 = this.buildDemoStore2(user);

      this.stores.update(list => [demoStore1, demoStore2, ...list.filter(s => s.id !== demoStore1.id && s.id !== demoStore2.id)]);
      this.currentUser.update(u => ({
        ...u,
        hasStore: true,
        store: demoStore1,
        stores: [demoStore1, demoStore2],
        lastUpdateDateTime: new Date().toISOString()
      }));
    }
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
      return {
        ...s,
        ...updated,
        socialMediaLinks: updated.socialMediaLinks
          ? normalizeSocialLinks(updated.socialMediaLinks, updated.userSocialLinks || s.userSocialLinks)
          : (updated.userSocialLinks ? normalizeSocialLinks(s.socialMediaLinks, updated.userSocialLinks) : s.socialMediaLinks),
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
  }

  // Update basic user profile
  updateUserProfile(updated: Partial<UserProfile>): void {
    this.currentUser.update(u => ({
      ...u,
      ...updated,
      lastUpdateDateTime: new Date().toISOString()
    }));
    if (this.authService.isLoggedIn()) {
      this.authService.updateUserProfile(updated);
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

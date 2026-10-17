import { Injectable, computed, signal } from '@angular/core';
import { StoreProfile, StoreReview, normalizeSocialLinks } from '../models/store.model';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
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
    hasStore: false,
    store: undefined
  });

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
      socialLinks: {
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
      memberSince: 'Jan 2026'
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
      socialLinks: {
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
      memberSince: 'Feb 2026'
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
      socialLinks: {
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
      memberSince: 'Nov 2025'
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
      socialLinks: {
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
      memberSince: 'Dec 2025'
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
      socialLinks: {
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
      memberSince: 'Jan 2026'
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
      socialLinks: {
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
      memberSince: 'Oct 2025'
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

  // Get single store by ID
  getStoreById(id: string): StoreProfile | undefined {
    return this.stores().find(s => s.id === id);
  }

  // Create a new store (Option A: transforms regular user into a store owner)
  createStore(storeData: Omit<StoreProfile, 'id' | 'userId' | 'rating' | 'reviewCount' | 'memberSince'>): StoreProfile {
    const user = this.currentUser();
    const newStoreId = 'store-' + (this.stores().length + 1);

    const initialReview: StoreReview = {
      id: 'rev-welcome-' + Date.now(),
      storeId: newStoreId,
      userName: 'AasPass Community Member',
      rating: 5.0,
      message: 'Welcome to the AasPass neighborhood network! Your store is live and ready to receive client ratings and gigs.',
      date: 'Just now'
    };

    const newStore: StoreProfile = {
      ...storeData,
      socialMediaLinks: normalizeSocialLinks(storeData.socialMediaLinks, storeData.socialLinks),
      id: newStoreId,
      userId: user.id,
      rating: 5.0,
      reviewCount: 1,
      reviews: [initialReview],
      memberSince: 'Just now'
    };

    // Add to stores list
    this.stores.update(list => [newStore, ...list]);

    // Update user profile to reflect that they now have a store!
    this.currentUser.update(u => ({
      ...u,
      hasStore: true,
      store: newStore
    }));

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
    if (user.store && user.store.id === storeId) {
      const updatedStore = this.getStoreById(storeId);
      if (updatedStore) {
        this.currentUser.update(u => ({
          ...u,
          store: updatedStore
        }));
      }
    }

    return newReview;
  }

  // Helper to toggle demo store for easy previewing of the Store Owner Review section
  toggleDemoStore(): void {
    const user = this.currentUser();
    if (user.hasStore) {
      this.currentUser.update(u => ({
        ...u,
        hasStore: false,
        store: undefined
      }));
    } else {
      const demoStore: StoreProfile = {
        id: 'store-user-001',
        userId: user.id,
        ownerName: user.name,
        storeName: 'Aman Tech & Creative Studio',
        tagline: 'Modern Web Apps, Python Scripts & Tech Consulting',
        category: 'Web & Tech',
        skills: ['Angular', 'TypeScript', 'Python', 'Tailwind CSS', 'API Integration'],
        experienceYears: 2,
        hourlyRate: 650,
        startingPrice: 500,
        area: user.area,
        city: user.city,
        distanceKm: 0.1,
        serviceRadiusKm: 8,
        socialMediaLinks: [
          { id: 'sm-u-1', name: 'GitHub', url: 'https://github.com/amansharma' },
          { id: 'sm-u-2', name: 'LinkedIn', url: 'https://linkedin.com/in/amansharma' },
          { id: 'sm-u-3', name: 'Portfolio', url: 'https://amansharma.dev' },
          { id: 'sm-u-4', name: 'Instagram', url: 'https://instagram.com/aman_codes' }
        ],
        socialLinks: {
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
        avatarUrl: user.avatarUrl,
        bannerGradient: 'from-indigo-600 via-purple-600 to-pink-500',
        isAvailable: true,
        memberSince: 'March 2026'
      };

      this.stores.update(list => [demoStore, ...list.filter(s => s.id !== demoStore.id)]);
      this.currentUser.update(u => ({
        ...u,
        hasStore: true,
        store: demoStore
      }));
    }
  }

  // Update existing store details
  updateStore(updated: Partial<StoreProfile>): void {
    const user = this.currentUser();
    if (!user.store) return;

    const merged = { ...user.store, ...updated };
    this.stores.update(list => list.map(s => s.id === merged.id ? merged : s));
    this.currentUser.update(u => ({
      ...u,
      store: merged
    }));
  }

  // Update basic user profile
  updateUserProfile(updated: Partial<UserProfile>): void {
    this.currentUser.update(u => ({
      ...u,
      ...updated
    }));
  }

  // Toggle store active/available status
  toggleStoreAvailability(): void {
    const user = this.currentUser();
    if (!user.store) return;
    const newStatus = !user.store.isAvailable;
    this.updateStore({ isAvailable: newStatus });
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

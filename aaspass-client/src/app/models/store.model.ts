export interface StoreServiceItem {
  id: string;
  name: string;
  price: number;
  duration?: string;
  description?: string;
}

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  youtube?: string;
}

export interface StoreReview {
  id: string;
  storeId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1.0 to 5.0 (min 1.0, max 5.0)
  message: string;
  date: string;
}

export interface StoreProfile {
  id: string;
  userId: string;
  ownerName: string;
  storeName: string;
  tagline: string;
  category: string;
  skills: string[];
  experienceYears: number;
  hourlyRate: number;
  startingPrice: number;
  area: string;
  city: string;
  distanceKm: number;
  serviceRadiusKm: number;
  socialLinks: SocialLinks;
  description: string;
  services: StoreServiceItem[];
  rating: number;
  reviewCount: number;
  reviews?: StoreReview[];
  avatarUrl: string;
  bannerGradient: string;
  isAvailable: boolean;
  memberSince: string;
}

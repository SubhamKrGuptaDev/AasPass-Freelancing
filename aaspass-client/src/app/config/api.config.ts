/**
 * Backend API configuration and endpoint mappings for Spring Boot REST services.
 */
export const API_BASE_URL = 'http://localhost:8080/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface BackendAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  tokenType?: string;
  user: BackendUserResponse;
}

export interface BackendUserResponse {
  id: number | string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  aadharNumber?: string;
  panNumber?: string;
  avatarUrl?: string;
  city?: string;
  area?: string;
  bio?: string;
  memberSince?: string;
  hasStore?: boolean;
  userSocialMediaLinks?: {
    instagram?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
    youtube?: string;
  };
  socialMediaLinks?: Array<{ id?: number | string; name: string; url: string }>;
  stores?: BackendStoreResponse[];
  addresses?: Array<{
    id?: number | string;
    addressType?: string;
    addressLine?: string;
    area: string;
    city: string;
    state?: string;
    pincode?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }>;
  creationDateTime?: string;
  lastUpdateDateTime?: string;
}

export interface BackendStoreResponse {
  id: number | string;
  userId: number | string;
  storeName: string;
  ownerName?: string;
  tagline?: string;
  category: string;
  skills?: string[];
  experienceYears?: number;
  hourlyRate?: number;
  startingPrice?: number;
  area: string;
  city: string;
  serviceRadiusKm?: number;
  distanceKm?: number;
  rating?: number;
  reviewCount?: number;
  description?: string;
  avatarUrl?: string;
  bannerGradient?: string;
  isAvailable?: boolean;
  memberSince?: string;
  views?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    lifetime?: number;
  };
  storeSocialMediaLinks?: {
    instagram?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
    youtube?: string;
  };
  socialMediaLinks?: Array<{ id?: number | string; name: string; url: string }>;
  services?: Array<{
    id?: number | string;
    name: string;
    price: number;
    duration?: string;
    description?: string;
  }>;
  reviews?: Array<{
    id?: number | string;
    userName: string;
    userAvatar?: string;
    rating: number;
    message?: string;
    reviewDate?: string;
  }>;
  creationDateTime?: string;
  lastUpdateDateTime?: string;
}

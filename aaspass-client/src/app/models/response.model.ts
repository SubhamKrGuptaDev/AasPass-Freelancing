import type { VerificationView } from './user.model';
/**
 * Backend API response interfaces mapping Spring Boot REST DTOs.
 * Only response interfaces and their respective response type aliases are defined here.
 */

export type ApiErrorCode =
  | 'TOKEN_EXPIRED'
  | 'UNAUTHENTICATED'
  | 'SESSION_REVOKED'
  | 'INVALID_CREDENTIALS'
  | 'FORBIDDEN'
  | 'CSRF_INVALID';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  code?: ApiErrorCode;
}

/** Payload of GET /auth/check-username and GET /auth/check-email. */
export interface BackendAvailabilityResponse {
  available: boolean;
}

export interface BackendSocialMediaLinkResponse {
  id?: number | string;
  name: string;
  url: string;
}

export interface BackendUserSocialMediaResponse {
  instagram?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  youtube?: string;
}

export interface BackendStoreSocialMediaResponse {
  instagram?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  youtube?: string;
}

export interface BackendStoreViewsResponse {
  daily?: number;
  weekly?: number;
  monthly?: number;
  lifetime?: number;
}

export interface BackendAddressResponse {
  id?: number | string;
  userId?: number | string;
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
  creationDateTime?: string;
  lastUpdateDateTime?: string;
}

export interface BackendStoreServiceResponse {
  id?: number | string;
  storeId?: number | string;
  name: string;
  price: number;
  duration?: string;
  description?: string;
  creationDateTime?: string;
}

export interface BackendStoreReviewResponse {
  id?: number | string;
  storeId?: number | string;
  userName: string;
  userAvatar?: string;
  rating: number;
  message?: string;
  reviewDate?: string;
  creationDateTime?: string;
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
  country?: string;
  googleMapLink?: string;
  serviceRadiusKm?: number;
  rating?: number;
  reviewCount?: number;
  description?: string;
  avatarUrl?: string;
  ownerProfilePictureUrl?: string | null;
  bannerGradient?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  bookingsOpen?: boolean;
  ownerVerified?: boolean;
  adminBlocked?: boolean;
  adminBlockReason?: string | null;
  memberSince?: string;
  views?: BackendStoreViewsResponse;
  storeSocialMediaLinks?: BackendStoreSocialMediaResponse;
  socialMediaLinks?: BackendSocialMediaLinkResponse[];
  services?: BackendStoreServiceResponse[];
  reviews?: BackendStoreReviewResponse[];
  creationDateTime?: string;
  lastUpdateDateTime?: string;
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
  profilePictureUrl?: string | null;
  city?: string;
  area?: string;
  country?: string;
  bio?: string;
  memberSince?: string;
  hasStore?: boolean;
  verified?: boolean;
  verification?: VerificationView | null;
  suspendedUntil?: string | null;
  userSocialMediaLinks?: BackendUserSocialMediaResponse;
  socialMediaLinks?: BackendSocialMediaLinkResponse[];
  stores?: BackendStoreResponse[];
  addresses?: BackendAddressResponse[];
  creationDateTime?: string;
  lastUpdateDateTime?: string;
}

export interface BackendAuthResponse {
  success: boolean;
  message: string;
  user: BackendUserResponse;
}

// Aliases matching backend DTO names
export type AuthResponse = BackendAuthResponse;
export type UserResponse = BackendUserResponse;
export type StoreResponse = BackendStoreResponse;
export type AddressResponse = BackendAddressResponse;
export type ServiceItemResponse = BackendStoreServiceResponse;
export type StoreReviewResponse = BackendStoreReviewResponse;
export type SocialMediaLinkResponse = BackendSocialMediaLinkResponse;

export interface BackendProfilePictureResponse {
  profilePictureUrl?: string | null;
}

/** Spring page wrapper used by paged endpoints (e.g. GET /api/bookings/mine). */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

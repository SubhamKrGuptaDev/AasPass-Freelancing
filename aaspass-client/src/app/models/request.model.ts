import type { HttpHeaders, HttpParams } from '@angular/common/http';

/**
 * Backend API request interfaces mapping Spring Boot REST DTOs and HTTP payloads.
 * Only request interfaces and their respective request type aliases are defined here.
 */

export interface RequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
}

export interface SocialMediaLinkRequest {
  id?: number | string;
  name: string;
  url: string;
}

export interface UserSocialMediaLinksRequest {
  instagram?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  youtube?: string;
}

export interface StoreSocialMediaLinksRequest {
  instagram?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  youtube?: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  area?: string;
  country?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UserUpdateRequest {
  name?: string;
  phone?: string;
  aadharNumber?: string;
  panNumber?: string;
  avatarUrl?: string;
  city?: string;
  area?: string;
  country?: string;
  bio?: string;
  userSocialMediaLinks?: UserSocialMediaLinksRequest | Record<string, string | undefined>;
  socialMediaLinks?: SocialMediaLinkRequest[] | Array<{ id?: number | string; name: string; url: string }>;
}

export interface AddressRequest {
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
}

export interface ServiceItemRequest {
  name: string;
  price: number;
  duration?: string;
  description?: string;
}

export interface StoreCreateRequest {
  userId: number | string;
  ownerName?: string;
  storeName: string;
  tagline?: string;
  category: string;
  skills?: string[];
  experienceYears?: number;
  hourlyRate?: number;
  startingPrice?: number;
  area: string;
  city: string;
  serviceRadiusKm?: number;
  description?: string;
  avatarUrl?: string;
  bannerGradient?: string;
  storeSocialMediaLinks?: StoreSocialMediaLinksRequest;
  socialMediaLinks?: SocialMediaLinkRequest[];
  services?: ServiceItemRequest[];
}

export interface StoreUpdateRequest {
  storeName?: string;
  ownerName?: string;
  tagline?: string;
  category?: string;
  skills?: string[];
  experienceYears?: number;
  hourlyRate?: number;
  startingPrice?: number;
  area?: string;
  city?: string;
  serviceRadiusKm?: number;
  description?: string;
  avatarUrl?: string;
  bannerGradient?: string;
  isAvailable?: boolean;
  storeSocialMediaLinks?: StoreSocialMediaLinksRequest;
  socialMediaLinks?: SocialMediaLinkRequest[];
}

export interface StoreReviewRequest {
  userName: string;
  userAvatar?: string;
  rating: number;
  message: string;
}

export interface AuthCredentials {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupRequest {
  name: string;
  username?: string;
  email?: string;
  usernameOrEmail?: string;
  password: string;
  phone?: string;
  city?: string;
  area?: string;
  country?: string;
  avatarUrl?: string;
}

// Aliases matching service payloads
export type LoginPayload = LoginRequest;
export type RegisterPayload = RegisterRequest;
export type UpdateUserPayload = UserUpdateRequest;
export type CreateStorePayload = StoreCreateRequest;
export type UpdateStorePayload = StoreUpdateRequest;
export type StoreReviewPayload = StoreReviewRequest;
export type AddressPayload = AddressRequest;
export type ServiceItemPayload = ServiceItemRequest;

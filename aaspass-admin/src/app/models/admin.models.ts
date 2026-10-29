/** Shared API contracts. Field names mirror the backend records in com.aaspass.admin.dto 1:1. */

/** Envelope returned by every backend endpoint; `code` carries the machine-readable error code. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  code: string | null;
}

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';

/** Path segment of `PUT /api/admin/users/{id}/verification/{item}`. */
export type VerificationItem = 'phone' | 'pan' | 'aadhar';

export type StoreStatusFilter = 'all' | 'active' | 'inactive' | 'blocked' | 'unreviewed';

export type UserVerificationFilter = 'all' | 'pending' | 'verified' | 'rejected';

export interface AdminStoreSummary {
  id: number;
  storeName: string;
  category: string;
  /** Owner fields are null when the store has no owner (orphaned row). */
  ownerId: number | null;
  ownerName: string | null;
  ownerUsername: string | null;
  city: string;
  country: string;
  area: string;
  isActive: boolean;
  adminBlocked: boolean;
  reviewed: boolean;
  creationDateTime: string;
}

export interface AdminOwnerSummary {
  id: number;
  name: string;
  username: string;
  email: string;
  verified: boolean;
  suspendedUntil: string | null;
}

export interface AdminStoreDetail {
  summary: AdminStoreSummary;
  tagline: string | null;
  description: string | null;
  googleMapLink: string | null;
  adminBlockReason: string | null;
  adminBlockedAt: string | null;
  adminReviewedAt: string | null;
  /** Null when the store has no owner (orphaned row). */
  owner: AdminOwnerSummary | null;
}

export interface AdminUserSummary {
  id: number;
  name: string;
  username: string;
  email: string;
  city: string;
  country: string;
  phoneStatus: VerificationStatus;
  panStatus: VerificationStatus;
  aadharStatus: VerificationStatus;
  suspendedUntil: string | null;
  storeCount: number;
  creationDateTime: string;
}

export interface VerificationItemView {
  status: VerificationStatus;
  reason: string | null;
}

export interface VerificationView {
  phone: VerificationItemView;
  pan: VerificationItemView;
  aadhar: VerificationItemView;
}

export interface AdminUserDetail {
  summary: AdminUserSummary;
  phone: string | null;
  aadharNumber: string | null;
  panNumber: string | null;
  verification: VerificationView;
  suspensionReason: string | null;
  bio: string | null;
  area: string | null;
  stores: AdminStoreSummary[];
}

export interface DashboardResponse {
  totalUsers: number;
  totalStores: number;
  activeStores: number;
  pendingUsers: number;
  unreviewedStores: number;
  blockedStores: number;
  suspendedUsers: number;
  recentPendingUsers: AdminUserSummary[];
  recentUnreviewedStores: AdminStoreSummary[];
}

export interface StoreSearchParams {
  country?: string;
  city?: string;
  name?: string;
  status?: StoreStatusFilter;
  page?: number;
  size?: number;
}

export interface UserSearchParams {
  q?: string;
  verification?: UserVerificationFilter;
  suspended?: boolean;
  page?: number;
  size?: number;
}

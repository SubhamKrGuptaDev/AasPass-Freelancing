import { StoreProfile, UserSocialMediaLinks, SocialMediaLink } from './store.model';

export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';

export interface VerificationItemView {
  status: VerificationStatus;
  reason?: string | null;
}

export interface VerificationView {
  phone: VerificationItemView;
  pan: VerificationItemView;
  aadhar: VerificationItemView;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone: string;
  aadharNumber?: string;
  panNumber?: string;
  avatarUrl: string;
  /** Uploaded profile picture (versioned URL); shown instead of the avatar when set. */
  profilePictureUrl?: string;
  city: string;
  area: string;
  country?: string;
  bio: string;
  memberSince: string;
  hasStore: boolean;
  /** True once an admin has verified at least one of the user's identity items. */
  verified: boolean;
  /** Per-item verification state; present only on the signed-in user's own record. */
  verification?: VerificationView;
  /** ISO instant until which the account is suspended; own record only. */
  suspendedUntil?: string | null;
  store?: StoreProfile;
  stores?: StoreProfile[];
  userSocialMediaLinks?: UserSocialMediaLinks;
  socialMediaLinks?: SocialMediaLink[];
  userSocialLinks?: UserSocialMediaLinks;
  creationDateTime: string;
  lastUpdateDateTime: string;
}

export type { AuthCredentials, SignupRequest } from './request.model';

/**
 * Returns a valid SVG avatar URL using Dicebear Avataaars seeded with the user identifier,
 * or generates a random avatar when no identifier is supplied.
 */
export function getRandomAvatarUrl(seed?: string): string {
  const clean = (seed && seed.trim())
    ? seed.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '')
    : '';
  const finalSeed = clean.length > 0 ? clean : 'user-' + Math.random().toString(36).substring(2, 8);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(finalSeed)}`;
}

/**
 * The image to show for a person everywhere (navbar, store cards, profile): the uploaded profile
 * picture when there is one, otherwise the generated avatar.
 */
export function displayImageUrl(profilePictureUrl?: string | null, avatarUrl?: string | null): string {
  return profilePictureUrl?.trim() || avatarUrl?.trim() || '';
}

/**
 * `(error)` handler for an <img> showing {@link displayImageUrl}: when the uploaded picture fails to
 * load, falls back to the avatar once (never loops if the avatar fails too).
 */
export function fallbackToAvatar(event: Event, avatarUrl?: string | null): void {
  const img = event.target as HTMLImageElement | null;
  const fallback = avatarUrl?.trim();
  if (!img || !fallback) {
    return;
  }
  const fallbackHref = new URL(fallback, img.baseURI).href;
  if (img.src !== fallbackHref) {
    img.src = fallbackHref;
  }
}

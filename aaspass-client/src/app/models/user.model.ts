import { StoreProfile, UserSocialMediaLinks, SocialMediaLink } from './store.model';

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone: string;
  aadharNumber?: string;
  panNumber?: string;
  avatarUrl: string;
  city: string;
  area: string;
  country?: string;
  bio: string;
  memberSince: string;
  hasStore: boolean;
  store?: StoreProfile;
  stores?: StoreProfile[];
  userSocialMediaLinks?: UserSocialMediaLinks;
  socialMediaLinks?: SocialMediaLink[];
  userSocialLinks?: UserSocialMediaLinks;
  creationDateTime: string;
  lastUpdateDateTime: string;
}
export interface UserAccount extends UserProfile {
  username: string;
  password?: string;
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

export interface AuthResult {
  success: boolean;
  message?: string;
  user?: UserProfile;
}

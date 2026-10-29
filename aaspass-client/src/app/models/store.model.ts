export interface StoreServiceItem {
  id: string;
  name: string;
  price: number;
  duration?: string;
  description?: string;
}

export interface StoreSocialMediaLinks {
  instagram?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  youtube?: string;
}

export interface UserSocialMediaLinks {
  instagram?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  youtube?: string;
}

// Backward-compatible aliases
export type UserSocialLinks = UserSocialMediaLinks;
export type SocialLinks = StoreSocialMediaLinks;

export interface SocialMediaLink {
  id: string;
  name: string; // e.g. "Instagram", "LinkedIn", "GitHub", "YouTube", "Portfolio", "Twitter / X", "Behance", etc.
  url: string;  // e.g. "https://instagram.com/myname"
}

export function formatSocialUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function displaySocialUrl(url: string): string {
  if (!url) return '';
  return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
}

export function getSocialIcon(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('instagram') || n.includes('insta')) return '📸';
  if (n.includes('linkedin')) return '💼';
  if (n.includes('github') || n.includes('git')) return '💻';
  if (n.includes('youtube') || n.includes('yt')) return '🎥';
  if (n.includes('twitter') || n.includes('x.com') || n === 'x') return '𝕏';
  if (n.includes('portfolio') || n.includes('website') || n.includes('web')) return '🌐';
  if (n.includes('behance')) return '🎨';
  if (n.includes('dribbble')) return '🏀';
  if (n.includes('facebook') || n.includes('fb')) return '👥';
  if (n.includes('discord')) return '💬';
  if (n.includes('medium') || n.includes('blog') || n.includes('substack')) return '✍️';
  if (n.includes('telegram')) return '✈️';
  if (n.includes('spotify') || n.includes('podcast')) return '🎙️';
  if (n.includes('figma')) return '🎯';
  if (n.includes('tiktok')) return '🎵';
  return '🔗';
}

export function getSocialBadgeClass(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('instagram') || n.includes('insta')) return 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 hover:text-pink-800';
  if (n.includes('linkedin')) return 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 hover:text-sky-800';
  if (n.includes('github') || n.includes('git')) return 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 hover:text-slate-900';
  if (n.includes('youtube') || n.includes('yt')) return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800';
  if (n.includes('twitter') || n.includes('x.com') || n === 'x') return 'bg-slate-900 text-white border-slate-900 hover:bg-black';
  if (n.includes('behance')) return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800';
  if (n.includes('dribbble')) return 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:text-rose-800';
  if (n.includes('portfolio') || n.includes('website')) return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800';
  return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900';
}

export function normalizeSocialLinks(
  socialMediaLinks?: SocialMediaLink[],
  embeddableLinks?: StoreSocialMediaLinks | UserSocialMediaLinks
): SocialMediaLink[] {
  if (socialMediaLinks && socialMediaLinks.length > 0) {
    return socialMediaLinks;
  }
  const result: SocialMediaLink[] = [];
  if (embeddableLinks) {
    if (embeddableLinks.instagram) result.push({ id: 'sm-ig', name: 'Instagram', url: embeddableLinks.instagram });
    if (embeddableLinks.linkedin) result.push({ id: 'sm-li', name: 'LinkedIn', url: embeddableLinks.linkedin });
    if (embeddableLinks.github) result.push({ id: 'sm-gh', name: 'GitHub', url: embeddableLinks.github });
    if (embeddableLinks.portfolio) result.push({ id: 'sm-pf', name: 'Portfolio', url: embeddableLinks.portfolio });
    if (embeddableLinks.youtube) result.push({ id: 'sm-yt', name: 'YouTube', url: embeddableLinks.youtube });
    if (embeddableLinks.twitter) result.push({ id: 'sm-tw', name: 'Twitter / X', url: embeddableLinks.twitter });
  }
  return result;
}

export function toStoreSocialMediaLinks(links: SocialMediaLink[]): StoreSocialMediaLinks {
  const result: StoreSocialMediaLinks = {};
  for (const link of links) {
    if (!link.url) continue;
    const n = (link.name || '').toLowerCase();
    const formatted = formatSocialUrl(link.url);
    if (n.includes('instagram')) result.instagram = formatted;
    else if (n.includes('linkedin')) result.linkedin = formatted;
    else if (n.includes('github')) result.github = formatted;
    else if (n.includes('portfolio') || n.includes('website')) result.portfolio = formatted;
    else if (n.includes('youtube')) result.youtube = formatted;
    else if (n.includes('twitter') || n.includes('x.com')) result.twitter = formatted;
  }
  return result;
}

export function toUserSocialMediaLinks(links: SocialMediaLink[]): UserSocialMediaLinks {
  const result: UserSocialMediaLinks = {};
  for (const link of links) {
    if (!link.url) continue;
    const n = (link.name || '').toLowerCase();
    const formatted = formatSocialUrl(link.url);
    if (n.includes('instagram')) result.instagram = formatted;
    else if (n.includes('linkedin')) result.linkedin = formatted;
    else if (n.includes('github')) result.github = formatted;
    else if (n.includes('portfolio') || n.includes('website')) result.portfolio = formatted;
    else if (n.includes('youtube')) result.youtube = formatted;
    else if (n.includes('twitter') || n.includes('x.com')) result.twitter = formatted;
  }
  return result;
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

export type EngagementViewType = 'daily' | 'weekly' | 'monthly' | 'lifetime';

export interface StoreEngagementStats {
  daily: number;
  weekly: number;
  monthly: number;
  lifetime: number;
}

export interface StoreViewRecord {
  id: string;
  storeId: string;
  timestamp: string; // ISO 8601 string
  viewerId?: string;
}

export interface EngagementTypeOption {
  type: EngagementViewType;
  label: string;
  icon: string;
  shortLabel: string;
  description: string;
}

export const ENGAGEMENT_TYPE_OPTIONS: EngagementTypeOption[] = [
  { type: 'daily', label: 'Daily', icon: '📅', shortLabel: 'Today', description: 'Store views and discovery within the last 24 hours' },
  { type: 'weekly', label: 'Weekly', icon: '📆', shortLabel: 'This Week', description: 'Store views and discovery across the last 7 days' },
  { type: 'monthly', label: 'Monthly', icon: '🗓️', shortLabel: 'This Month', description: 'Store views and discovery across the last 30 days' },
  { type: 'lifetime', label: 'Lifetime', icon: '♾️', shortLabel: 'All Time', description: 'All-time cumulative store visits since opening' }
];

export function getStoreViews(store?: StoreProfile): StoreEngagementStats {
  if (!store || !store.views) {
    return { daily: 0, weekly: 0, monthly: 0, lifetime: 0 };
  }
  return store.views;
}

export function getEngagementCount(store?: StoreProfile, type: EngagementViewType = 'lifetime'): number {
  const views = getStoreViews(store);
  return views[type] ?? views.lifetime ?? 0;
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
  country: string;
  /** Optional Google Maps link to the store's location. */
  googleMapLink?: string;
  serviceRadiusKm: number;
  storeSocialMediaLinks?: StoreSocialMediaLinks;
  userSocialLinks?: StoreSocialMediaLinks;
  socialMediaLinks: SocialMediaLink[];
  description: string;
  services: StoreServiceItem[];
  rating: number;
  reviewCount: number;
  reviews?: StoreReview[];
  views?: StoreEngagementStats;
  viewHistory?: StoreViewRecord[];
  avatarUrl: string;
  /** Owner's uploaded profile picture (versioned URL); shown on the card instead of avatarUrl when set. */
  ownerProfilePictureUrl?: string;
  bannerGradient: string;
  isAvailable: boolean;
  /** Published and visible in store search. New stores start inactive until the owner activates them. */
  isActive?: boolean;
  /** Whether the store owner is verified (public). */
  ownerVerified: boolean;
  /** Set by an admin; only meaningful on the owner's own record. */
  adminBlocked?: boolean;
  adminBlockReason?: string | null;
  memberSince: string;
  creationDateTime: string;
  lastUpdateDateTime: string;
}

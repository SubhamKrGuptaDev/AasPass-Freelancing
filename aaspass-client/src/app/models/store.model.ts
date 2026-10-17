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
  socialLinks?: SocialLinks
): SocialMediaLink[] {
  if (socialMediaLinks && socialMediaLinks.length > 0) {
    return socialMediaLinks;
  }
  const result: SocialMediaLink[] = [];
  if (socialLinks) {
    if (socialLinks.instagram) result.push({ id: 'sm-ig', name: 'Instagram', url: socialLinks.instagram });
    if (socialLinks.linkedin) result.push({ id: 'sm-li', name: 'LinkedIn', url: socialLinks.linkedin });
    if (socialLinks.github) result.push({ id: 'sm-gh', name: 'GitHub', url: socialLinks.github });
    if (socialLinks.portfolio) result.push({ id: 'sm-pf', name: 'Portfolio', url: socialLinks.portfolio });
    if (socialLinks.youtube) result.push({ id: 'sm-yt', name: 'YouTube', url: socialLinks.youtube });
    if (socialLinks.twitter) result.push({ id: 'sm-tw', name: 'Twitter / X', url: socialLinks.twitter });
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
  socialLinks?: SocialLinks;
  socialMediaLinks: SocialMediaLink[];
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

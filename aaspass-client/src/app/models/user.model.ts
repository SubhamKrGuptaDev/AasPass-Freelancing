import { StoreProfile } from './store.model';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  aadharNumber?: string;
  panNumber?: string;
  avatarUrl: string;
  city: string;
  area: string;
  bio: string;
  memberSince: string;
  hasStore: boolean;
  store?: StoreProfile;
}


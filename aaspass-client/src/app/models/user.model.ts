import { StoreProfile, UserSocialLinks } from './store.model';

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
  stores?: StoreProfile[];
  userSocialLinks?: UserSocialLinks;
  creationDateTime: string;
  lastUpdateDateTime: string;
}
export interface UserAccount extends UserProfile {
  username: string;
  password?: string;
}

export interface AuthCredentials {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupRequest {
  name: string;
  usernameOrEmail: string;
  password: string;
  phone?: string;
  city?: string;
  area?: string;
}

export interface AuthResult {
  success: boolean;
  message?: string;
  user?: UserProfile;
}

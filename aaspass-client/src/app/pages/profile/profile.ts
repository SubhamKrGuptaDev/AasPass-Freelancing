import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store/store.service';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';
import { SocialMediaLinksComponent } from '../../components/social-media-links/social-media-links';
import { 
  StoreProfile, 
  SocialMediaLink, 
  StoreSocialMediaLinks,
  UserSocialMediaLinks,
  toUserSocialMediaLinks,
  formatSocialUrl, 
  displaySocialUrl, 
  getSocialIcon, 
  getSocialBadgeClass, 
  normalizeSocialLinks,
  EngagementViewType,
  EngagementTypeOption,
  getEngagementCount
} from '../../models/store.model';
import { DEFAULT_ENGAGEMENT_TYPE, ENABLED_ENGAGEMENT_TYPE_OPTIONS, FEATURE_FLAGS } from '../../config/feature-flags';
import { getRandomAvatarUrl } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SocialMediaLinksComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent {
  storeService = inject(StoreService);
  authService = inject(AuthService);
  private toast = inject(ToastService);

  // KYC (Aadhaar / PAN): stored values are masked by the backend and shown read-only;
  // a new value is typed into a single inline input and saved through the dedicated KYC endpoint.
  editingKyc = signal<'aadhaar' | 'pan' | null>(null);
  kycInput = signal('');
  kycSaving = signal(false);

  startKycEdit(field: 'aadhaar' | 'pan'): void {
    this.editingKyc.set(field);
    this.kycInput.set('');
  }

  cancelKycEdit(): void {
    this.editingKyc.set(null);
    this.kycInput.set('');
  }

  /** Stores the typed KYC value; PAN is uppercased as typed. */
  setKycInput(value: string): void {
    this.kycInput.set(this.editingKyc() === 'pan' ? value.toUpperCase() : value);
  }

  onKycInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.setKycInput(target.value);
      if (target.value !== this.kycInput()) {
        target.value = this.kycInput();
      }
    }
  }

  submitKyc(): void {
    const field = this.editingKyc();
    const value = this.kycInput().trim();
    if (!field || !value || this.kycSaving()) {
      return;
    }
    const payload = field === 'aadhaar' ? { aadharNumber: value } : { panNumber: value };
    this.kycSaving.set(true);
    this.authService.updateKyc(payload).subscribe({
      next: () => {
        this.kycSaving.set(false);
        this.cancelKycEdit();
        this.toast.success(field === 'aadhaar' ? 'Aadhaar updated' : 'PAN updated');
      },
      error: () => {
        // The error interceptor shows the toast; the editor stays open so the value can be corrected.
        this.kycSaving.set(false);
      }
    });
  }

  isEditingUser = false;
  editName = this.storeService.currentUser().name;
  editUsername = this.storeService.currentUser().username || '';
  editPhone = this.storeService.currentUser().phone;
  editArea = this.storeService.currentUser().area;
  editCity = this.storeService.currentUser().city;
  editCountry = this.storeService.currentUser().country || 'India';
  editBio = this.storeService.currentUser().bio;
  editAvatarUrl = this.storeService.currentUser().avatarUrl || '';

  editUserSocialLinks: SocialMediaLink[] = [];

  formatUrl = formatSocialUrl;
  displayUrl = displaySocialUrl;
  getSocialIcon = getSocialIcon;
  getSocialBadgeClass = getSocialBadgeClass;
  getRandomAvatarUrl = getRandomAvatarUrl;

  randomizeAvatar(): void {
    const randomSeed = 'user-' + Math.random().toString(36).substring(2, 9);
    this.editAvatarUrl = getRandomAvatarUrl(randomSeed);
  }

  handleAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = getRandomAvatarUrl(this.storeService.currentUser().name);
    }
  }

  startEditUser(): void {
    const user = this.storeService.currentUser();
    this.editName = user.name;
    this.editUsername = user.username || '';
    this.editPhone = user.phone;
    this.editArea = user.area;
    this.editCity = user.city;
    this.editCountry = user.country || 'India';
    this.editBio = user.bio;
    this.editAvatarUrl = user.avatarUrl || getRandomAvatarUrl(user.name);
    this.editUserSocialLinks = this.getUserSocialLinks().map(l => ({ ...l }));
    this.isEditingUser = true;
  }

  toggleEditUser(): void {
    if (this.isEditingUser) {
      this.isEditingUser = false;
    } else {
      this.startEditUser();
    }
  }

  getUserSocialLinks(): SocialMediaLink[] {
    const u = this.storeService.currentUser();
    return normalizeSocialLinks(u.socialMediaLinks, u.userSocialMediaLinks || u.userSocialLinks);
  }

  getStoreSocialLinks(store: StoreProfile): SocialMediaLink[] {
    return normalizeSocialLinks(store.socialMediaLinks, store.storeSocialMediaLinks || store.userSocialLinks);
  }

  // Selected store state for multi-store switcher
  selectedStoreId = signal<string>('');

  selectedStore = computed(() => {
    const list = this.storeService.userStores();
    if (list.length === 0) return undefined;
    const currentId = this.selectedStoreId();
    const found = list.find(s => s.id === currentId);
    return found || list[0];
  });

  selectStore(id: string): void {
    this.selectedStoreId.set(id);
    this.isAddingReview = false;
    this.reviewFormError = null;
  }

  deleteStore(storeId: string): void {
    const target = this.storeService.getStoreById(storeId);
    const storeName = target?.storeName || 'this store';
    if (confirm(`Are you sure you want to delete "${storeName}"? This action cannot be undone.`)) {
      this.storeService.deleteStore(storeId);
      const remaining = this.storeService.userStores();
      if (remaining.length > 0) {
        this.selectedStoreId.set(remaining[0].id);
      } else {
        this.selectedStoreId.set('');
      }
    }
  }

  // Review section for store owner
  isAddingReview = false;
  newReviewUserName = '';
  newReviewRating = 5.0;
  newReviewMessage = '';
  reviewFormError: string | null = null;

  saveUserDetails(): void {
    const validSocial = this.editUserSocialLinks
      .map(l => ({
        id: l.id || ('usr-sm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
        name: l.name.trim(),
        url: l.url.trim()
      }))
      .filter(l => l.name.length > 0 && l.url.length > 0);

    const userSocialMediaLinks = toUserSocialMediaLinks(validSocial);

    // If user does not have an image, add random avatar when saving UserDetails
    const finalAvatar = (this.editAvatarUrl && this.editAvatarUrl.trim())
      ? this.editAvatarUrl.trim()
      : (this.storeService.currentUser().avatarUrl && this.storeService.currentUser().avatarUrl.trim()
          ? this.storeService.currentUser().avatarUrl.trim()
          : getRandomAvatarUrl(this.editName || 'user'));

    this.storeService.updateUserProfile({
      name: this.editName,
      phone: this.editPhone,
      area: this.editArea,
      city: this.editCity,
      country: this.editCountry,
      bio: this.editBio,
      avatarUrl: finalAvatar,
      socialMediaLinks: validSocial,
      userSocialMediaLinks: userSocialMediaLinks,
      userSocialLinks: userSocialMediaLinks
    });
    this.isEditingUser = false;
  }

  setNewRating(val: number): void {
    const num = Number(val);
    if (isNaN(num)) {
      this.newReviewRating = 5.0;
      return;
    }
    // strictly enforce min 1.0 and max 5.0
    this.newReviewRating = Math.max(1.0, Math.min(5.0, Math.round(num * 10) / 10));
  }

  submitStoreReview(storeId: string): void {
    if (!this.newReviewUserName || !this.newReviewUserName.trim()) {
      this.reviewFormError = 'Please provide the Review User Name.';
      return;
    }

    if (this.newReviewRating < 1.0 || this.newReviewRating > 5.0) {
      this.reviewFormError = 'Rating must be between 1.0 (min) and 5.0 (max).';
      return;
    }

    if (!this.newReviewMessage || !this.newReviewMessage.trim()) {
      this.reviewFormError = 'Please write a review message.';
      return;
    }

    this.reviewFormError = null;
    this.storeService.addReview(storeId, {
      userName: this.newReviewUserName.trim(),
      rating: this.newReviewRating,
      message: this.newReviewMessage.trim()
    });

    this.toast.success(`Added ${this.newReviewRating.toFixed(1)}★ review from "${this.newReviewUserName.trim()}".`);
    this.newReviewUserName = '';
    this.newReviewRating = 5.0;
    this.newReviewMessage = '';
    this.isAddingReview = false;
  }

  // Engagement tracking state for store owner (Daily, Weekly, Monthly, Lifetime)
  // Visible timeframes and the simulate button are controlled by code-level FEATURE_FLAGS
  selectedEngagementType = signal<EngagementViewType>(DEFAULT_ENGAGEMENT_TYPE);
  engagementOptions = ENABLED_ENGAGEMENT_TYPE_OPTIONS;
  readonly showViewSimulation = FEATURE_FLAGS.showViewSimulation;

  selectedEngagementOption = computed<EngagementTypeOption>(() => {
    const t = this.selectedEngagementType();
    return this.engagementOptions.find(o => o.type === t) || this.engagementOptions[0];
  });

  selectEngagementType(type: EngagementViewType): void {
    this.selectedEngagementType.set(type);
  }

  getStoreEngagement(store: StoreProfile, type: EngagementViewType): number {
    return getEngagementCount(store, type);
  }

  getEngagementShortLabel(type: EngagementViewType): string {
    const opt = this.engagementOptions.find(o => o.type === type);
    return opt?.shortLabel || type;
  }

  simulateStoreView(storeId: string): void {
    this.storeService.recordStoreView(storeId);
    const store = this.storeService.getStoreById(storeId);
    const storeName = store?.storeName || 'Store';
    this.toast.info(`Recorded 1 new view for "${storeName}". Daily, weekly, monthly & lifetime updated!`);
  }
}

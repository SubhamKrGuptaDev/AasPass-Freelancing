import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth/auth.service';
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
  ENGAGEMENT_TYPE_OPTIONS,
  EngagementTypeOption,
  getEngagementCount
} from '../../models/store.model';
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

  isEditingUser = false;
  editName = this.storeService.currentUser().name;
  editPhone = this.storeService.currentUser().phone;
  editAadhar = this.storeService.currentUser().aadharNumber || '';
  editPan = this.storeService.currentUser().panNumber || '';
  editArea = this.storeService.currentUser().area;
  editCity = this.storeService.currentUser().city;
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
    this.editPhone = user.phone;
    this.editAadhar = user.aadharNumber || '';
    this.editPan = user.panNumber || '';
    this.editArea = user.area;
    this.editCity = user.city;
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
    this.reviewSuccessMessage = null;
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
  reviewSuccessMessage: string | null = null;

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
      aadharNumber: this.editAadhar,
      panNumber: this.editPan ? this.editPan.toUpperCase() : '',
      area: this.editArea,
      city: this.editCity,
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

    this.reviewSuccessMessage = `Added ${this.newReviewRating.toFixed(1)}★ review from "${this.newReviewUserName.trim()}".`;
    this.newReviewUserName = '';
    this.newReviewRating = 5.0;
    this.newReviewMessage = '';
    this.isAddingReview = false;

    setTimeout(() => {
      this.reviewSuccessMessage = null;
    }, 4000);
  }

  // Engagement tracking state for store owner (Daily, Weekly, Monthly, Lifetime)
  selectedEngagementType = signal<EngagementViewType>('daily');
  engagementOptions = ENGAGEMENT_TYPE_OPTIONS;
  viewSimulationToast: string | null = null;

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
    this.viewSimulationToast = `Recorded 1 new view for "${storeName}". Daily, weekly, monthly & lifetime updated!`;
    setTimeout(() => {
      this.viewSimulationToast = null;
    }, 4000);
  }
}

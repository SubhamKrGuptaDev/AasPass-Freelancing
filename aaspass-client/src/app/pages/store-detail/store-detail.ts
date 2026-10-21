import { Component, inject, computed, signal, effect, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store/store.service';
import { AuthService } from '../../services/auth/auth.service';
import { 
  StoreProfile, 
  StoreServiceItem, 
  SocialMediaLink, 
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

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './store-detail.html',
  styleUrl: './store-detail.css'
})
export class StoreDetailComponent {
  private route = inject(ActivatedRoute);
  private routeParamMap = toSignal(this.route.paramMap);
  storeService = inject(StoreService);

  notificationMessage: string | null = null;

  formatUrl = formatSocialUrl;
  authService = inject(AuthService);
  router = inject(Router);

  displayUrl = displaySocialUrl;
  getSocialIcon = getSocialIcon;
  getSocialBadgeClass = getSocialBadgeClass;

  getStoreSocialLinks(store: StoreProfile): SocialMediaLink[] {
    return normalizeSocialLinks(store.socialMediaLinks, store.storeSocialMediaLinks || store.userSocialLinks);
  }

  getOwnerUserSocialLinks(store: StoreProfile): SocialMediaLink[] {
    const currentUser = this.storeService.currentUser();
    if (store.userId === currentUser.id) {
      return normalizeSocialLinks(currentUser.socialMediaLinks, currentUser.userSocialMediaLinks || currentUser.userSocialLinks);
    }
    return [];
  }

  getCurrentUrl(): string {
    return this.router.url;
  }

  // Review Form state
  reviewUserName: string = this.storeService.currentUser().name;
  reviewRating: number = 5.0;
  reviewMessage: string = '';
  reviewError: string | null = null;

  store = computed(() => {
    const params = this.routeParamMap();
    const id = params?.get('id') || this.route.snapshot.paramMap.get('id');
    return id ? this.storeService.getStoreById(id) : undefined;
  });

  isOwner = computed(() => {
    if (!this.authService.isLoggedIn()) return false;
    const s = this.store();
    if (!s) return false;
    const currentUserId = this.storeService.currentUser().id;
    const userStores = this.storeService.userStores();
    return s.userId === currentUserId || userStores.some(us => us.id === s.id) || this.storeService.currentUser().store?.id === s.id;
  });


  // Engagement tracking state for store owner
  selectedEngagementType = signal<EngagementViewType>('lifetime');
  engagementOptions = ENGAGEMENT_TYPE_OPTIONS;

  selectEngagementType(type: EngagementViewType): void {
    this.selectedEngagementType.set(type);
  }

  getStoreEngagement(store: StoreProfile, type: EngagementViewType): number {
    return getEngagementCount(store, type);
  }

  private lastRecordedStoreId: string | null = null;

  constructor() {
    effect(() => {
      const s = this.store();
      const currentId = s?.id;
      if (currentId && this.lastRecordedStoreId !== currentId) {
        this.lastRecordedStoreId = currentId;
        untracked(() => {
          this.storeService.recordStoreView(currentId);
        });
      }
    });
  }

  setRating(val: number): void {
    const num = Number(val);
    if (isNaN(num)) {
      this.reviewRating = 5.0;
      return;
    }
    // Strictly enforce min 1.0 and max 5.0
    this.reviewRating = Math.max(1.0, Math.min(5.0, Math.round(num * 10) / 10));
  }

  submitReview(): void {
    const s = this.store();
    if (!s) return;

    if (!this.reviewUserName || !this.reviewUserName.trim()) {
      this.reviewError = 'Please provide the Review User Name.';
      return;
    }

    if (this.reviewRating < 1.0 || this.reviewRating > 5.0) {
      this.reviewError = 'Rating must be between 1.0 (minimum) and 5.0 (maximum).';
      return;
    }

    if (!this.reviewMessage || !this.reviewMessage.trim()) {
      this.reviewError = 'Please enter a review message.';
      return;
    }

    this.reviewError = null;
    this.storeService.addReview(s.id, {
      userName: this.reviewUserName.trim(),
      rating: this.reviewRating,
      message: this.reviewMessage.trim()
    });

    this.showToast(`Thank you! Your ${this.reviewRating.toFixed(1)}★ review for ${s.ownerName} was posted.`);
    this.reviewMessage = '';
  }

  selectService(srv: StoreServiceItem): void {
    this.showToast(`Request sent for "${srv.name}" (₹${srv.price}). The freelancer will contact you shortly!`);
  }

  triggerInquiry(): void {
    const s = this.store();
    if (s) {
      this.showToast(`Direct message sent to ${s.ownerName}! You can now coordinate nearby.`);
    }
  }

  triggerCall(): void {
    const s = this.store();
    if (s) {
      this.showToast(`Phone callback request shared with ${s.ownerName}.`);
    }
  }

  private showToast(msg: string): void {
    this.notificationMessage = msg;
    setTimeout(() => {
      this.notificationMessage = null;
    }, 4000);
  }
}

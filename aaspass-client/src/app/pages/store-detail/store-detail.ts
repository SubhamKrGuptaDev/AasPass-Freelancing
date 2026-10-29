import { Component, inject, computed, signal, effect, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { clampRating, notBlank } from '../../forms/validators';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store/store.service';
import { ToastService } from '../../services/toast/toast.service';
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
  EngagementTypeOption,
  getEngagementCount
} from '../../models/store.model';
import { DEFAULT_ENGAGEMENT_TYPE, ENABLED_ENGAGEMENT_TYPE_OPTIONS } from '../../config/feature-flags';

import { VerifiedBadgeComponent } from '../../components/verified-badge/verified-badge';
import { displayImageUrl, fallbackToAvatar } from '../../models/user.model';
@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, VerifiedBadgeComponent],
  templateUrl: './store-detail.html',
  styleUrl: './store-detail.css'
})
export class StoreDetailComponent {
  protected readonly displayImageUrl = displayImageUrl;
  protected readonly fallbackToAvatar = fallbackToAvatar;
  private route = inject(ActivatedRoute);
  private routeParamMap = toSignal(this.route.paramMap);
  storeService = inject(StoreService);

  private toast = inject(ToastService);

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
  readonly reviewForm = new FormGroup({
    rating: new FormControl<number | null>(5.0, [Validators.required, Validators.min(1.0), Validators.max(5.0)]),
    message: new FormControl('', { nonNullable: true, validators: [notBlank] })
  });
  reviewError: string | null = null;
  /** True while a review POST is in flight; blocks double submits. */
  readonly reviewSubmitting = signal(false);

  store = computed(() => {
    const params = this.routeParamMap();
    const key = this.routeUrlKey(params);
    return key ? this.storeService.getStoreByUrlKey(key) : undefined;
  });

  private routeUrlKey(params: ParamMap | null | undefined): string {
    return params?.get('storeKey') || this.route.snapshot.paramMap.get('storeKey') || '';
  }

  isOwner = computed(() => {
    if (!this.authService.isLoggedIn()) return false;
    const s = this.store();
    if (!s) return false;
    const currentUserId = this.storeService.currentUser().id;
    const userStores = this.storeService.userStores();
    return s.userId === currentUserId || userStores.some(us => us.id === s.id) || this.storeService.currentUser().store?.id === s.id;
  });


  // Engagement tracking state for store owner
  // Visible timeframes are controlled by code-level FEATURE_FLAGS
  selectedEngagementType = signal<EngagementViewType>(DEFAULT_ENGAGEMENT_TYPE);
  engagementOptions = ENABLED_ENGAGEMENT_TYPE_OPTIONS;

  selectEngagementType(type: EngagementViewType): void {
    this.selectedEngagementType.set(type);
  }

  getStoreEngagement(store: StoreProfile, type: EngagementViewType): number {
    return getEngagementCount(store, type);
  }

  private lastRecordedStoreId: string | null = null;

  constructor() {
    // Canonicalize the URL: old /stores/{id} links and links with an outdated store name
    // are replaced with the current /stores/{name}-{id}
    effect(() => {
      const canonicalKey = this.storeService.getStoreUrlKey(this.store());
      const currentKey = this.routeUrlKey(this.routeParamMap());
      if (canonicalKey && currentKey && currentKey !== canonicalKey) {
        untracked(() => {
          this.router.navigate(['/stores', canonicalKey], { replaceUrl: true });
        });
      }
    });

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

  /** Strictly enforces min 1.0 and max 5.0. */
  setRating(val: unknown): void {
    this.reviewForm.controls.rating.setValue(clampRating(val));
  }

  submitReview(): void {
    const s = this.store();
    if (!s || this.reviewSubmitting()) return;

    const { rating, message } = this.reviewForm.controls;
    const ratingValue = rating.value;
    if (rating.invalid || ratingValue === null) {
      this.reviewError = 'Rating must be between 1.0 (minimum) and 5.0 (maximum).';
      return;
    }

    if (message.invalid) {
      this.reviewError = 'Please enter a review message.';
      return;
    }

    this.reviewError = null;
    this.reviewSubmitting.set(true);
    this.storeService.addReview(s.id, {
      rating: ratingValue,
      message: message.value.trim()
    }).pipe(
      finalize(() => this.reviewSubmitting.set(false))
    ).subscribe({
      next: () => {
        this.toast.success(`Thank you! Your ${ratingValue.toFixed(1)}★ review for ${s.ownerName} was posted.`);
        message.reset();
      },
      error: () => {
        // The error interceptor shows the toast; the form keeps the typed message.
      }
    });
  }

  selectService(srv: StoreServiceItem): void {
    this.toast.success(`Request sent for "${srv.name}" (₹${srv.price}). The freelancer will contact you shortly!`);
  }

  triggerInquiry(): void {
    const s = this.store();
    if (s) {
      this.toast.success(`Direct message sent to ${s.ownerName}! You can now coordinate nearby.`);
    }
  }

  triggerCall(): void {
    const s = this.store();
    if (s) {
      this.toast.success(`Phone callback request shared with ${s.ownerName}.`);
    }
  }
}

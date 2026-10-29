import { Component, inject, signal, computed, Injector, afterNextRender } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CountryPickerComponent } from '../../components/location-picker/country-picker';
import { CityPickerComponent } from '../../components/location-picker/city-picker';
import { StoreService } from '../../services/store/store.service';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';
import {
  SocialMediaLinksComponent,
  createSocialLinksArray,
  setSocialLinks,
  toValidSocialLinks
} from '../../components/social-media-links/social-media-links';
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
import { clampRating, notBlank } from '../../forms/validators';
import { DEFAULT_COUNTRY } from '../../geo/country';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SocialMediaLinksComponent, CountryPickerComponent, CityPickerComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent {
  storeService = inject(StoreService);
  authService = inject(AuthService);
  private toast = inject(ToastService);
  private injector = inject(Injector);
  private document = inject(DOCUMENT);

  // KYC (Aadhaar / PAN): stored values are masked by the backend and shown read-only;
  // a new value is typed into a single inline input and saved through the dedicated KYC endpoint.
  editingKyc = signal<'aadhaar' | 'pan' | null>(null);
  readonly kycControl = new FormControl('', { nonNullable: true, validators: [notBlank] });
  kycSaving = signal(false);

  constructor() {
    // PAN is uppercased as typed.
    this.kycControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
      if (this.editingKyc() === 'pan' && value !== value.toUpperCase()) {
        this.kycControl.setValue(value.toUpperCase(), { emitEvent: false });
      }
    });
  }

  startKycEdit(field: 'aadhaar' | 'pan'): void {
    if (this.kycSaving()) {
      return;
    }
    this.editingKyc.set(field);
    this.kycControl.reset();
    this.focusAfterRender(`kyc-${field}-input`);
  }

  cancelKycEdit(): void {
    const field = this.editingKyc();
    this.editingKyc.set(null);
    this.kycControl.reset();
    if (field) {
      this.focusAfterRender(`kyc-${field}-update`);
    }
  }

  /** Moves focus to the element with the given id once the next render has put it in the DOM. */
  private focusAfterRender(id: string): void {
    afterNextRender(() => this.document.getElementById(id)?.focus(), { injector: this.injector });
  }

  submitKyc(): void {
    const field = this.editingKyc();
    const value = this.kycControl.value.trim();
    if (!field || this.kycControl.invalid || this.kycSaving()) {
      return;
    }
    const payload = field === 'aadhaar' ? { aadharNumber: value } : { panNumber: value };
    this.kycSaving.set(true);
    this.authService.updateKyc(payload).subscribe({
      next: () => {
        this.kycSaving.set(false);
        // Only close the editor if it still shows the field that was saved.
        if (this.editingKyc() === field) {
          this.cancelKycEdit();
        }
        this.toast.success(field === 'aadhaar' ? 'Aadhaar updated' : 'PAN updated');
      },
      error: () => {
        // The error interceptor shows the toast; the editor stays open so the value can be corrected.
        this.kycSaving.set(false);
      }
    });
  }

  isEditingUser = false;
  readonly profileForm = new FormGroup({
    name: new FormControl(this.storeService.currentUser().name, { nonNullable: true }),
    phone: new FormControl(this.storeService.currentUser().phone, { nonNullable: true }),
    country: new FormControl(this.storeService.currentUser().country || DEFAULT_COUNTRY, { nonNullable: true }),
    city: new FormControl(this.storeService.currentUser().city, { nonNullable: true }),
    area: new FormControl(this.storeService.currentUser().area, { nonNullable: true }),
    bio: new FormControl(this.storeService.currentUser().bio, { nonNullable: true }),
    avatarUrl: new FormControl(this.storeService.currentUser().avatarUrl || '', { nonNullable: true }),
    socialMediaLinks: createSocialLinksArray()
  });

  formatUrl = formatSocialUrl;
  displayUrl = displaySocialUrl;
  getSocialIcon = getSocialIcon;
  getSocialBadgeClass = getSocialBadgeClass;
  getRandomAvatarUrl = getRandomAvatarUrl;

  randomizeAvatar(): void {
    const randomSeed = 'user-' + Math.random().toString(36).substring(2, 9);
    this.profileForm.controls.avatarUrl.setValue(getRandomAvatarUrl(randomSeed));
  }

  handleAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = getRandomAvatarUrl(this.storeService.currentUser().name);
    }
  }

  startEditUser(): void {
    const user = this.storeService.currentUser();
    this.profileForm.patchValue({
      name: user.name,
      phone: user.phone,
      area: user.area,
      city: user.city,
      country: user.country || DEFAULT_COUNTRY,
      bio: user.bio,
      avatarUrl: user.avatarUrl || getRandomAvatarUrl(user.name)
    });
    setSocialLinks(this.profileForm.controls.socialMediaLinks, this.getUserSocialLinks());
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
  readonly reviewForm = new FormGroup({
    rating: new FormControl<number | null>(5.0, [Validators.required, Validators.min(1.0), Validators.max(5.0)]),
    message: new FormControl('', { nonNullable: true, validators: [notBlank] })
  });
  reviewFormError: string | null = null;
  /** True while a review POST is in flight; blocks double submits. */
  readonly reviewSubmitting = signal(false);

  saveUserDetails(): void {
    const form = this.profileForm.getRawValue();
    const validSocial = toValidSocialLinks(this.profileForm.controls.socialMediaLinks, 'usr-sm-');

    const userSocialMediaLinks = toUserSocialMediaLinks(validSocial);

    // If user does not have an image, add random avatar when saving UserDetails
    const finalAvatar = form.avatarUrl.trim()
      ? form.avatarUrl.trim()
      : (this.storeService.currentUser().avatarUrl && this.storeService.currentUser().avatarUrl.trim()
          ? this.storeService.currentUser().avatarUrl.trim()
          : getRandomAvatarUrl(form.name || 'user'));

    this.storeService.updateUserProfile({
      name: form.name,
      phone: form.phone,
      area: form.area,
      city: form.city,
      country: form.country,
      bio: form.bio,
      avatarUrl: finalAvatar,
      socialMediaLinks: validSocial,
      userSocialMediaLinks: userSocialMediaLinks,
      userSocialLinks: userSocialMediaLinks
    });
    this.isEditingUser = false;
  }

  /** Strictly enforces min 1.0 and max 5.0. */
  setNewRating(val: unknown): void {
    this.reviewForm.controls.rating.setValue(clampRating(val));
  }

  submitStoreReview(storeId: string): void {
    if (this.reviewSubmitting()) {
      return;
    }
    const { rating, message } = this.reviewForm.controls;
    if (rating.invalid || rating.value === null) {
      this.reviewFormError = 'Rating must be between 1.0 (min) and 5.0 (max).';
      return;
    }

    if (message.invalid) {
      this.reviewFormError = 'Please write a review message.';
      return;
    }

    this.reviewFormError = null;
    this.reviewSubmitting.set(true);
    this.storeService.addReview(storeId, {
      rating: rating.value,
      message: message.value.trim()
    }).pipe(
      finalize(() => this.reviewSubmitting.set(false))
    ).subscribe({
      next: review => {
        this.toast.success(`Added ${review.rating.toFixed(1)}★ review as "${review.userName}".`);
        this.reviewForm.reset({ rating: 5.0, message: '' });
        this.isAddingReview = false;
      },
      error: () => {
        // The error interceptor shows the toast; the form stays open so the review can be resent.
      }
    });
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

import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GOOGLE_MAP_LINK_MAX_LENGTH, GOOGLE_MAP_LINK_PATTERN, notBlank } from '../../forms/validators';
import { map } from 'rxjs';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CountryPickerComponent } from '../../components/location-picker/country-picker';
import { CityPickerComponent } from '../../components/location-picker/city-picker';
import { StoreService } from '../../services/store/store.service';
import { DEFAULT_COUNTRY } from '../../geo/country';
import { ToastService } from '../../services/toast/toast.service';
import {
  SocialMediaLinksComponent,
  createSocialLinksArray,
  setSocialLinks,
  toValidSocialLinks
} from '../../components/social-media-links/social-media-links';
import { 
  StoreProfile, 
  StoreServiceItem, 
  SocialMediaLink, 
  StoreSocialMediaLinks,
  UserSocialLinks,
  toStoreSocialMediaLinks,
  formatSocialUrl, 
  displaySocialUrl, 
  getSocialIcon, 
  getSocialBadgeClass, 
  normalizeSocialLinks 
} from '../../models/store.model';

@Component({
  selector: 'app-create-store',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SocialMediaLinksComponent, CountryPickerComponent, CityPickerComponent],
  templateUrl: './create-store.html',
  styleUrl: './create-store.css'
})
export class CreateStoreComponent implements OnInit {
  storeService = inject(StoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  availableCategories = this.storeService.categories.filter(c => c !== 'All');

  isEditing = false;
  editingStoreId = '';

  isSubmitting = signal<boolean>(false);

  readonly storeForm = new FormGroup({
    storeName: new FormControl('QuickEdits Bangalore', { nonNullable: true }),
    tagline: new FormControl('Fast 24-hour turnaround Instagram reels and shorts for local creators', { nonNullable: true }),
    category: new FormControl('Video & Editing', { nonNullable: true }),
    experienceYears: new FormControl<number | null>(2),
    skills: new FormControl('Short Reels, Adobe Premiere, Color Grading', { nonNullable: true }),
    hourlyRate: new FormControl<number | null>(500),
    startingPrice: new FormControl<number | null>(350),
    area: new FormControl('Indiranagar', { nonNullable: true }),
    country: new FormControl(DEFAULT_COUNTRY, { nonNullable: true, validators: [notBlank] }),
    city: new FormControl('Bengaluru', { nonNullable: true, validators: [notBlank] }),
    serviceRadiusKm: new FormControl<number>(5, { nonNullable: true }),
    // Optional; blank is allowed, otherwise it must be a Google Maps link
    googleMapLink: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(GOOGLE_MAP_LINK_MAX_LENGTH), Validators.pattern(GOOGLE_MAP_LINK_PATTERN)]
    }),
    description: new FormControl('Specializing in fast video editing for neighborhood businesses, gyms, restaurants, and personal brands. Available for direct meetups and quick shoots.', { nonNullable: true }),
    socialMediaLinks: createSocialLinksArray([
      { id: 'sm-init-1', name: 'Instagram', url: 'https://instagram.com/myreels' },
      { id: 'sm-init-2', name: 'LinkedIn', url: 'https://linkedin.com/in/myprofile' },
      { id: 'sm-init-3', name: 'Portfolio', url: 'https://myportfolio.site' }
    ])
  });

  /** Live form value for the preview card; a signal so programmatic patches re-render too. */
  readonly formValue = toSignal(
    this.storeForm.valueChanges.pipe(map(() => this.storeForm.getRawValue())),
    { initialValue: this.storeForm.getRawValue() }
  );

  formatUrl = formatSocialUrl;
  displayUrl = displaySocialUrl;
  getSocialIcon = getSocialIcon;
  getSocialBadgeClass = getSocialBadgeClass;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const editId = params.get('editStoreId');
      this.initForm(editId);
    });
  }

  private initForm(editId: string | null): void {
    const user = this.storeService.currentUser();
    const links = this.storeForm.controls.socialMediaLinks;

    if (editId) {
      const storeToEdit = this.storeService.getStoreById(editId);
      if (storeToEdit && (storeToEdit.userId === user.id || (user.stores || []).some(s => s.id === storeToEdit.id))) {
        this.isEditing = true;
        this.editingStoreId = storeToEdit.id;
        this.storeForm.patchValue({
          storeName: storeToEdit.storeName,
          tagline: storeToEdit.tagline,
          category: storeToEdit.category,
          experienceYears: storeToEdit.experienceYears,
          hourlyRate: storeToEdit.hourlyRate,
          startingPrice: storeToEdit.startingPrice,
          area: storeToEdit.area,
          country: storeToEdit.country || DEFAULT_COUNTRY,
          city: storeToEdit.city,
          serviceRadiusKm: storeToEdit.serviceRadiusKm,
          googleMapLink: storeToEdit.googleMapLink ?? '',
          description: storeToEdit.description,
          skills: (storeToEdit.skills ?? []).join(', ')
        });

        const normalized = normalizeSocialLinks(storeToEdit.socialMediaLinks, storeToEdit.storeSocialMediaLinks || storeToEdit.userSocialLinks);
        setSocialLinks(links, normalized ?? []);
        return;
      }
    }

    // Creating a new store (either first store or an additional store!)
    this.isEditing = false;
    this.editingStoreId = '';
    this.storeForm.patchValue({
      googleMapLink: '',
      area: user.area || 'Indiranagar',
      country: user.country || DEFAULT_COUNTRY,
      city: user.city || 'Bengaluru'
    });

    const currentOwnedCount = this.storeService.userStores().length;
    if (currentOwnedCount > 0) {
      // Customize starter text for additional store
      this.storeForm.patchValue({
        storeName: `${(user.name ?? '').split(' ')[0] || 'My'}'s Studio #${currentOwnedCount + 1}`,
        tagline: 'Professional freelance services tailored for local clients',
        category: 'Graphics & Design',
        skills: 'Branding, Figma, Visual Design, Poster Design',
        hourlyRate: 600,
        startingPrice: 450
      });
      setSocialLinks(links, [
        { id: 'sm-init-1', name: 'Instagram', url: '' },
        { id: 'sm-init-2', name: 'LinkedIn', url: '' }
      ]);
    } else {
      this.storeForm.patchValue({
        storeName: 'QuickEdits Bangalore',
        tagline: 'Fast 24-hour turnaround Instagram reels and shorts for local creators',
        category: 'Video & Editing',
        experienceYears: 2,
        hourlyRate: 500,
        startingPrice: 350,
        skills: 'Short Reels, Adobe Premiere, Color Grading'
      });
      setSocialLinks(links, [
        { id: 'sm-init-1', name: 'Instagram', url: 'https://instagram.com/myreels' },
        { id: 'sm-init-2', name: 'LinkedIn', url: 'https://linkedin.com/in/myprofile' },
        { id: 'sm-init-3', name: 'Portfolio', url: 'https://myportfolio.site' }
      ]);
    }
  }

  onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    const { country, city } = this.storeForm.controls;
    if (country.invalid || city.invalid) {
      // The pickers have no native `required`, so block here and say what is missing.
      country.markAsTouched();
      city.markAsTouched();
      this.toast.error('Please select your country and city.');
      return;
    }

    const { googleMapLink } = this.storeForm.controls;
    if (googleMapLink.invalid) {
      googleMapLink.markAsTouched();
      this.toast.error('Please paste a Google Maps link (e.g. https://maps.app.goo.gl/...), or leave it empty.');
      return;
    }

    const formData = this.storeForm.getRawValue();
    const skills = formData.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const validSocialLinks: SocialMediaLink[] = toValidSocialLinks(this.storeForm.controls.socialMediaLinks);

    const storeSocialMediaLinks: StoreSocialMediaLinks = toStoreSocialMediaLinks(validSocialLinks);

    if (this.isEditing && this.editingStoreId) {
      this.isSubmitting.set(true);

      this.storeService.updateStore({
        storeName: formData.storeName,
        tagline: formData.tagline,
        category: formData.category,
        skills: skills.length ? skills : ['General Freelancer'],
        experienceYears: Number(formData.experienceYears) || 1,
        hourlyRate: Number(formData.hourlyRate) || 500,
        startingPrice: Number(formData.startingPrice) || 300,
        area: formData.area,
        country: formData.country,
        city: formData.city,
        serviceRadiusKm: Number(formData.serviceRadiusKm) || 5,
        googleMapLink: formData.googleMapLink.trim(),
        socialMediaLinks: validSocialLinks,
        storeSocialMediaLinks: storeSocialMediaLinks,
        userSocialLinks: storeSocialMediaLinks,
        description: formData.description
      }, this.editingStoreId).subscribe({
        next: (savedStore) => {
          this.isSubmitting.set(false);
          // Use the returned store so a rename navigates to the updated name-id URL
          this.router.navigate(['/stores', this.storeService.getStoreUrlKey(savedStore) || this.editingStoreId]);
        },
        error: (err: unknown) => {
          this.isSubmitting.set(false);
          this.reportSaveError(err, 'Failed to update store details. Please try again.');
        }
      });
      return;
    }

    const initialServices: StoreServiceItem[] = [
      {
        id: 's-initial-1',
        name: 'Single Package / Gig Delivery',
        price: Number(formData.startingPrice) || 300,
        duration: '24 hours',
        description: 'Complete milestone delivery with revision and satisfaction guarantee.'
      },
      {
        id: 's-initial-2',
        name: 'Hourly Custom Work / Consultation',
        price: Number(formData.hourlyRate) || 500,
        duration: 'Hourly',
        description: 'Dedicated one-on-one session or customized project milestone.'
      }
    ];

    this.isSubmitting.set(true);

    this.storeService.createStore({
      ownerName: this.storeService.currentUser().name,
      storeName: formData.storeName,
      tagline: formData.tagline,
      category: formData.category,
      skills: skills.length ? skills : ['General Freelancer'],
      experienceYears: Number(formData.experienceYears) || 1,
      hourlyRate: Number(formData.hourlyRate) || 500,
      startingPrice: Number(formData.startingPrice) || 300,
      area: formData.area,
      country: formData.country,
      city: formData.city,
      serviceRadiusKm: Number(formData.serviceRadiusKm) || 5,
      googleMapLink: formData.googleMapLink.trim() || undefined,
      socialMediaLinks: validSocialLinks,
      storeSocialMediaLinks: storeSocialMediaLinks,
      userSocialLinks: storeSocialMediaLinks,
      description: formData.description,
      services: initialServices,
      avatarUrl: this.storeService.currentUser().avatarUrl,
      bannerGradient: 'from-indigo-600 via-purple-600 to-pink-500',
      isAvailable: true
    }).subscribe({
      next: (persistedStore) => {
        this.isSubmitting.set(false);
        // Navigate directly to the verified persisted store detail page!
        this.router.navigate(['/stores', this.storeService.getStoreUrlKey(persistedStore)]);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        this.reportSaveError(err, 'Failed to save store. Please try again.');
      }
    });
  }

  /** HTTP failures are already toasted by the error interceptor; only non-HTTP failures need a toast here. */
  private reportSaveError(err: unknown, fallback: string): void {
    if (err instanceof HttpErrorResponse) {
      return;
    }
    this.toast.error(err instanceof Error && err.message ? err.message : fallback);
  }
}

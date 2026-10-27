import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store/store.service';
import { SocialMediaLinksComponent } from '../../components/social-media-links/social-media-links';
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
  imports: [CommonModule, FormsModule, RouterLink, SocialMediaLinksComponent],
  templateUrl: './create-store.html',
  styleUrl: './create-store.css'
})
export class CreateStoreComponent implements OnInit {
  storeService = inject(StoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  availableCategories = [
    'Video & Editing',
    'Web & Tech',
    'Photography',
    'Tutoring & Education',
    'Graphics & Design',
    'Tech Support & Hardware'
  ];

  skillsInput = 'Short Reels, Adobe Premiere, Color Grading';

  isEditing = false;
  editingStoreId = '';

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  private errorToastTimer: any = null;

  showErrorToast(msg: string): void {
    this.errorMessage.set(msg);
    if (this.errorToastTimer) {
      clearTimeout(this.errorToastTimer);
    }
    this.errorToastTimer = setTimeout(() => {
      this.errorMessage.set(null);
    }, 8000);
  }

  dismissError(): void {
    if (this.errorToastTimer) {
      clearTimeout(this.errorToastTimer);
    }
    this.errorMessage.set(null);
  }

  formData = {
    storeName: 'QuickEdits Bangalore',
    tagline: 'Fast 24-hour turnaround Instagram reels and shorts for local creators',
    category: 'Video & Editing',
    experienceYears: 2,
    hourlyRate: 500,
    startingPrice: 350,
    area: 'Indiranagar',
    city: 'Bengaluru',
    serviceRadiusKm: 5,
    description: 'Specializing in fast video editing for neighborhood businesses, gyms, restaurants, and personal brands. Available for direct meetups and quick shoots.'
  };

  socialMediaLinks: SocialMediaLink[] = [
    { id: 'sm-init-1', name: 'Instagram', url: 'https://instagram.com/myreels' },
    { id: 'sm-init-2', name: 'LinkedIn', url: 'https://linkedin.com/in/myprofile' },
    { id: 'sm-init-3', name: 'Portfolio', url: 'https://myportfolio.site' }
  ];

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

    if (editId) {
      const storeToEdit = this.storeService.getStoreById(editId);
      if (storeToEdit && (storeToEdit.userId === user.id || (user.stores || []).some(s => s.id === storeToEdit.id))) {
        this.isEditing = true;
        this.editingStoreId = storeToEdit.id;
        this.formData.storeName = storeToEdit.storeName;
        this.formData.tagline = storeToEdit.tagline;
        this.formData.category = storeToEdit.category;
        this.formData.experienceYears = storeToEdit.experienceYears;
        this.formData.hourlyRate = storeToEdit.hourlyRate;
        this.formData.startingPrice = storeToEdit.startingPrice;
        this.formData.area = storeToEdit.area;
        this.formData.city = storeToEdit.city;
        this.formData.serviceRadiusKm = storeToEdit.serviceRadiusKm;
        this.formData.description = storeToEdit.description;
        this.skillsInput = storeToEdit.skills.join(', ');
        
        const normalized = normalizeSocialLinks(storeToEdit.socialMediaLinks, storeToEdit.storeSocialMediaLinks || storeToEdit.userSocialLinks);
        if (normalized && normalized.length > 0) {
          this.socialMediaLinks = normalized.map(l => ({ ...l }));
        } else {
          this.socialMediaLinks = [];
        }
        return;
      }
    }

    // Creating a new store (either first store or an additional store!)
    this.isEditing = false;
    this.editingStoreId = '';
    this.formData.area = user.area || 'Indiranagar';
    this.formData.city = user.city || 'Bengaluru';

    const currentOwnedCount = this.storeService.userStores().length;
    if (currentOwnedCount > 0) {
      // Customize starter text for additional store
      this.formData.storeName = `${user.name.split(' ')[0]}'s Studio #${currentOwnedCount + 1}`;
      this.formData.tagline = 'Professional freelance services tailored for local clients';
      this.formData.category = 'Graphics & Design';
      this.skillsInput = 'Branding, Figma, Visual Design, Poster Design';
      this.formData.hourlyRate = 600;
      this.formData.startingPrice = 450;
      this.socialMediaLinks = [
        { id: 'sm-init-1', name: 'Instagram', url: '' },
        { id: 'sm-init-2', name: 'LinkedIn', url: '' }
      ];
    } else {
      this.formData.storeName = 'QuickEdits Bangalore';
      this.formData.tagline = 'Fast 24-hour turnaround Instagram reels and shorts for local creators';
      this.formData.category = 'Video & Editing';
      this.formData.experienceYears = 2;
      this.formData.hourlyRate = 500;
      this.formData.startingPrice = 350;
      this.skillsInput = 'Short Reels, Adobe Premiere, Color Grading';
      this.socialMediaLinks = [
        { id: 'sm-init-1', name: 'Instagram', url: 'https://instagram.com/myreels' },
        { id: 'sm-init-2', name: 'LinkedIn', url: 'https://linkedin.com/in/myprofile' },
        { id: 'sm-init-3', name: 'Portfolio', url: 'https://myportfolio.site' }
      ];
    }
  }

  addLink(presetName: string = ''): void {
    this.socialMediaLinks.push({
      id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: presetName,
      url: ''
    });
  }

  removeLink(index: number): void {
    this.socialMediaLinks.splice(index, 1);
  }

  onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    const skills = this.skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const validSocialLinks: SocialMediaLink[] = this.socialMediaLinks
      .map(l => ({
        id: l.id || ('sm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
        name: l.name.trim(),
        url: l.url.trim()
      }))
      .filter(l => l.name.length > 0 && l.url.length > 0);

    const storeSocialMediaLinks: StoreSocialMediaLinks = toStoreSocialMediaLinks(validSocialLinks);

    if (this.isEditing && this.editingStoreId) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      this.storeService.updateStore({
        storeName: this.formData.storeName,
        tagline: this.formData.tagline,
        category: this.formData.category,
        skills: skills.length ? skills : ['General Freelancer'],
        experienceYears: Number(this.formData.experienceYears) || 1,
        hourlyRate: Number(this.formData.hourlyRate) || 500,
        startingPrice: Number(this.formData.startingPrice) || 300,
        area: this.formData.area,
        city: this.formData.city,
        serviceRadiusKm: Number(this.formData.serviceRadiusKm) || 5,
        socialMediaLinks: validSocialLinks,
        storeSocialMediaLinks: storeSocialMediaLinks,
        userSocialLinks: storeSocialMediaLinks,
        description: this.formData.description
      }, this.editingStoreId).subscribe({
        next: (savedStore) => {
          this.isSubmitting.set(false);
          // Use the returned store so a rename navigates to the updated name-id URL
          this.router.navigate(['/stores', this.storeService.getStoreUrlKey(savedStore) || this.editingStoreId]);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err?.error?.message || err?.message || 'Failed to update store details in database. Please try again.';
          this.showErrorToast(msg);
        }
      });
      return;
    }

    const initialServices: StoreServiceItem[] = [
      {
        id: 's-initial-1',
        name: 'Single Package / Gig Delivery',
        price: this.formData.startingPrice,
        duration: '24 hours',
        description: 'Complete milestone delivery with revision and satisfaction guarantee.'
      },
      {
        id: 's-initial-2',
        name: 'Hourly Custom Work / Consultation',
        price: this.formData.hourlyRate,
        duration: 'Hourly',
        description: 'Dedicated one-on-one session or customized project milestone.'
      }
    ];

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.storeService.createStore({
      ownerName: this.storeService.currentUser().name,
      storeName: this.formData.storeName,
      tagline: this.formData.tagline,
      category: this.formData.category,
      skills: skills.length ? skills : ['General Freelancer'],
      experienceYears: Number(this.formData.experienceYears) || 1,
      hourlyRate: Number(this.formData.hourlyRate) || 500,
      startingPrice: Number(this.formData.startingPrice) || 300,
      area: this.formData.area,
      city: this.formData.city,
      distanceKm: 0.5,
      serviceRadiusKm: Number(this.formData.serviceRadiusKm) || 5,
      socialMediaLinks: validSocialLinks,
      storeSocialMediaLinks: storeSocialMediaLinks,
      userSocialLinks: storeSocialMediaLinks,
      description: this.formData.description,
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
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to save store to the database. Please ensure backend service is running and try again.';
        this.showErrorToast(msg);
      }
    });
  }
}

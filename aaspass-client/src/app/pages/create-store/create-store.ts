import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { 
  StoreProfile, 
  StoreServiceItem, 
  SocialMediaLink, 
  SocialLinks, 
  formatSocialUrl, 
  displaySocialUrl, 
  getSocialIcon, 
  getSocialBadgeClass, 
  normalizeSocialLinks 
} from '../../models/store.model';

@Component({
  selector: 'app-create-store',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
            Option A • Unified Account
          </div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">
            {{ isEditing ? 'Edit Store: ' + (formData.storeName || 'My Skill Store') : (storeService.userStores().length > 0 ? 'Open Another Neighborhood Skill Store' : 'Open Your Neighborhood Skill Store') }}
          </h1>
          <p class="text-sm text-slate-500 max-w-xl mx-auto mt-2">
            {{ isEditing ? 'Update your service packages, neighborhood operating radius, and social media links.' : 'Turn your skills into passive or side income. You can open and manage multiple stores under one unified account.' }}
          </p>
          @if (!isEditing && storeService.userStores().length > 0) {
            <div class="inline-flex items-center gap-2 mt-3 px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
              <span>🏪 You currently manage {{ storeService.userStores().length }} store(s). This will add Store #{{ storeService.userStores().length + 1 }}.</span>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Form (2 Columns) -->
          <div class="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            
            <form (ngSubmit)="onSubmit()" class="space-y-6">
              
              <!-- Section 1: Basic Store Identity -->
              <div>
                <h3 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                  <span>Store Name & Category</span>
                </h3>

                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Store / Brand Name *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.storeName" 
                      name="storeName" 
                      required 
                      placeholder="e.g. SnapEdit Studio, CodeCraft Mentorship"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">Freelance Category *</label>
                      <select 
                        [(ngModel)]="formData.category" 
                        name="category" 
                        class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                      >
                        <option *ngFor="let cat of availableCategories" [value]="cat">{{ cat }}</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
                      <input 
                        type="number" 
                        [(ngModel)]="formData.experienceYears" 
                        name="experienceYears" 
                        min="0" 
                        max="30"
                        class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Punchy Headline / Tagline *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.tagline" 
                      name="tagline" 
                      required 
                      placeholder="e.g. High-converting Instagram reels & YouTube shorts for local brands"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Key Skills (comma separated) *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="skillsInput" 
                      name="skills" 
                      placeholder="e.g. Premiere Pro, CapCut, Color Grading, Sound Design"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <!-- Section 2: Pricing & Location -->
              <div>
                <h3 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>Pricing & Neighborhood Radius</span>
                </h3>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Hourly Charges (₹) *</label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-bold">₹</span>
                      <input 
                        type="number" 
                        [(ngModel)]="formData.hourlyRate" 
                        name="hourlyRate" 
                        required 
                        min="100" 
                        step="50"
                        class="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Starting Price for Gigs (₹) *</label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-bold">₹</span>
                      <input 
                        type="number" 
                        [(ngModel)]="formData.startingPrice" 
                        name="startingPrice" 
                        required 
                        min="100" 
                        step="50"
                        class="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Neighborhood / Area *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.area" 
                      name="area" 
                      required 
                      placeholder="e.g. Indiranagar"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">City *</label>
                    <select 
                      [(ngModel)]="formData.city" 
                      name="city" 
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                    >
                      <option *ngFor="let c of storeService.availableCities" [value]="c">{{ c }}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Operating Radius</label>
                    <select 
                      [(ngModel)]="formData.serviceRadiusKm" 
                      name="serviceRadiusKm" 
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                    >
                      <option [value]="5">5 km radius</option>
                      <option [value]="10">10 km radius</option>
                      <option [value]="20">20 km radius</option>
                      <option [value]="50">Entire City</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Section 3: Multiple Social Media Links & Portfolios -->
              <div>
                <div class="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
                  <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                    <span>Social Media & Online Portfolios</span>
                  </h3>
                  <span class="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    {{ socialMediaLinks.length }} links added
                  </span>
                </div>

                <p class="text-xs text-slate-500 mb-4 leading-relaxed">
                  Add multiple social media and portfolio links with their platform names. When clients view your store or profile, they can click directly to redirect to your social channels.
                </p>

                <!-- Quick Preset Chips -->
                <div class="mb-4">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Quick Add Platform:</span>
                  <div class="flex flex-wrap gap-1.5">
                    <button 
                      type="button" 
                      (click)="addLink('Instagram')"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 transition cursor-pointer"
                    >
                      + 📸 Instagram
                    </button>
                    <button 
                      type="button" 
                      (click)="addLink('LinkedIn')"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition cursor-pointer"
                    >
                      + 💼 LinkedIn
                    </button>
                    <button 
                      type="button" 
                      (click)="addLink('GitHub')"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition cursor-pointer"
                    >
                      + 💻 GitHub
                    </button>
                    <button 
                      type="button" 
                      (click)="addLink('YouTube')"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition cursor-pointer"
                    >
                      + 🎥 YouTube
                    </button>
                    <button 
                      type="button" 
                      (click)="addLink('Portfolio')"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                    >
                      + 🌐 Portfolio
                    </button>
                    <button 
                      type="button" 
                      (click)="addLink('Twitter / X')"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-black border border-slate-800 transition cursor-pointer"
                    >
                      + 𝕏 Twitter / X
                    </button>
                    <button 
                      type="button" 
                      (click)="addLink('Behance')"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                    >
                      + 🎨 Behance
                    </button>
                    <button 
                      type="button" 
                      (click)="addLink('Dribbble')"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                    >
                      + 🏀 Dribbble
                    </button>
                  </div>
                </div>

                <datalist id="socialPlatformsList">
                  <option value="Instagram"></option>
                  <option value="LinkedIn"></option>
                  <option value="GitHub"></option>
                  <option value="YouTube"></option>
                  <option value="Portfolio Website"></option>
                  <option value="Twitter / X"></option>
                  <option value="Behance"></option>
                  <option value="Dribbble"></option>
                  <option value="Facebook"></option>
                  <option value="Discord"></option>
                  <option value="Medium / Blog"></option>
                  <option value="Spotify / Podcast"></option>
                </datalist>

                <!-- List of Dynamic Social Media Links -->
                <div class="space-y-3 mb-4">
                  @for (link of socialMediaLinks; track link.id || $index; let i = $index) {
                    <div class="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>{{ getSocialIcon(link.name) }}</span>
                          <span>{{ link.name || 'Platform #' + (i + 1) }}</span>
                        </span>
                        
                        <div class="flex items-center gap-2">
                          @if (link.url) {
                            <a 
                              [href]="formatUrl(link.url)" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                              title="Test direct redirect in new tab"
                            >
                              <span>Direct Redirect ↗</span>
                            </a>
                          }
                          <button 
                            type="button" 
                            (click)="removeLink(i)"
                            class="text-xs font-semibold text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer"
                            title="Remove this link"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div class="sm:col-span-5">
                          <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Social Media Name *
                          </label>
                          <input 
                            type="text" 
                            [(ngModel)]="link.name" 
                            [name]="'linkName_' + i"
                            list="socialPlatformsList"
                            required
                            placeholder="e.g. Instagram, LinkedIn, Behance"
                            class="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div class="sm:col-span-7">
                          <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Link URL (Redirects Viewer) *
                          </label>
                          <input 
                            type="text" 
                            [(ngModel)]="link.url" 
                            [name]="'linkUrl_' + i"
                            required
                            placeholder="https://instagram.com/yourhandle or profile url"
                            class="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  }

                  @if (socialMediaLinks.length === 0) {
                    <div class="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                      No social media links added yet. Click "+ Add Another Social Link" or choose a preset above.
                    </div>
                  }
                </div>

                <!-- Add Button -->
                <button 
                  type="button" 
                  (click)="addLink()"
                  class="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>+ Add Another Social Link</span>
                </button>
              </div>

              <!-- Section 4: Detailed Description -->
              <div>
                <h3 class="text-sm font-bold text-slate-900 mb-2">About Your Services & Workflow</h3>
                <textarea 
                  [(ngModel)]="formData.description" 
                  name="description" 
                  rows="4" 
                  placeholder="Tell nearby clients about your background, what makes your work fast/reliable, and how you prefer meeting or coordinating..."
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                ></textarea>
              </div>

              <!-- Submit Button & Navigation -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <a 
                  routerLink="/profile" 
                  class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                >
                  ← Back to Profile
                </a>
                <button 
                  type="submit" 
                  class="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition transform active:scale-98 cursor-pointer"
                >
                  {{ isEditing ? '💾 Update Store & Social Links' : '🚀 Publish Store & Start Receiving Gigs' }}
                </button>
              </div>

            </form>

          </div>

          <!-- Live Card Preview (1 Column) -->
          <div class="space-y-4">
            <div class="sticky top-24">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Live Preview in Neighborhood</span>
              
              <div class="bg-white rounded-2xl border border-indigo-200 overflow-hidden shadow-lg p-5">
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    📍 0.5 km away • {{ formData.area || 'Your Area' }}
                  </span>
                  <span class="text-xs font-bold text-amber-500">⭐ 5.0 (New)</span>
                </div>

                <div class="flex items-start gap-3 mb-3">
                  <img 
                    [src]="storeService.currentUser().avatarUrl" 
                    alt="Avatar" 
                    class="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <h4 class="font-bold text-slate-900 text-sm">
                      {{ formData.storeName || 'Your Store Name' }}
                    </h4>
                    <p class="text-xs text-slate-500">
                      by {{ storeService.currentUser().name }} • {{ formData.experienceYears }} yrs exp
                    </p>
                  </div>
                </div>

                <p class="text-xs text-slate-700 font-medium mb-3 line-clamp-2">
                  {{ formData.tagline || 'Your catchy tagline will appear here for nearby searchers.' }}
                </p>

                <!-- Live Preview of Social Media Links -->
                @if (socialMediaLinks.length > 0) {
                  <div class="mb-3 pt-2.5 border-t border-slate-100">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Social Profiles (Direct Redirect)</span>
                    <div class="flex flex-wrap gap-1">
                      @for (link of socialMediaLinks; track link.id || $index) {
                        @if (link.name && link.url) {
                          <a 
                            [href]="formatUrl(link.url)" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition shadow-2xs {{ getSocialBadgeClass(link.name) }}"
                            title="Directly redirect to {{ link.name }}"
                          >
                            <span>{{ getSocialIcon(link.name) }}</span>
                            <span>{{ link.name }} ↗</span>
                          </a>
                        }
                      }
                    </div>
                  </div>
                }

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] uppercase font-semibold text-slate-400 block">Rate</span>
                    <span class="text-base font-extrabold text-indigo-700">₹{{ formData.hourlyRate || 500 }}</span>
                    <span class="text-xs text-slate-500">/hr</span>
                  </div>
                  <span class="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700">
                    Active
                  </span>
                </div>
              </div>

              <!-- Tip card -->
              <div class="mt-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
                <p class="font-bold mb-1">💡 Neighborhood Tip:</p>
                <p class="text-indigo-800 leading-relaxed">
                  Adding your Instagram, LinkedIn, and portfolio links allows clients to view your previous work directly and builds 3x higher trust!
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  `
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
        
        const normalized = normalizeSocialLinks(storeToEdit.socialMediaLinks, storeToEdit.socialLinks);
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

    const legacySocialLinks: SocialLinks = {};
    for (const link of validSocialLinks) {
      const n = link.name.toLowerCase();
      if (n.includes('instagram')) legacySocialLinks.instagram = formatSocialUrl(link.url);
      else if (n.includes('linkedin')) legacySocialLinks.linkedin = formatSocialUrl(link.url);
      else if (n.includes('github')) legacySocialLinks.github = formatSocialUrl(link.url);
      else if (n.includes('portfolio') || n.includes('website')) legacySocialLinks.portfolio = formatSocialUrl(link.url);
      else if (n.includes('youtube')) legacySocialLinks.youtube = formatSocialUrl(link.url);
      else if (n.includes('twitter') || n.includes('x.com')) legacySocialLinks.twitter = formatSocialUrl(link.url);
    }

    if (this.isEditing && this.editingStoreId) {
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
        socialLinks: legacySocialLinks,
        description: this.formData.description
      }, this.editingStoreId);
      this.router.navigate(['/stores', this.editingStoreId]);
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

    const newStore = this.storeService.createStore({
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
      socialLinks: legacySocialLinks,
      description: this.formData.description,
      services: initialServices,
      avatarUrl: this.storeService.currentUser().avatarUrl,
      bannerGradient: 'from-indigo-600 via-purple-600 to-pink-500',
      isAvailable: true
    });

    // Navigate directly to the newly created store detail page!
    this.router.navigate(['/stores', newStore.id]);
  }
}

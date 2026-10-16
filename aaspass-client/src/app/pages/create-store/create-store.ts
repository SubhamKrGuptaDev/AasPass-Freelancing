import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { StoreServiceItem } from '../../models/store.model';

@Component({
  selector: 'app-create-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
            Option A • Unified Account
          </div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">
            Open Your Neighborhood Skill Store
          </h1>
          <p class="text-sm text-slate-500 max-w-xl mx-auto mt-2">
            Turn your skills into passive or side income. Start receiving freelance inquiries from clients in your local area.
          </p>
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

              <!-- Section 3: Social Media Accounts (As requested by user!) -->
              <div>
                <h3 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Social Media & Online Portfolios</span>
                </h3>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Instagram Profile</label>
                    <input 
                      type="url" 
                      [(ngModel)]="formData.socialLinks.instagram" 
                      name="instagram" 
                      placeholder="https://instagram.com/yourhandle"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                    <input 
                      type="url" 
                      [(ngModel)]="formData.socialLinks.linkedin" 
                      name="linkedin" 
                      placeholder="https://linkedin.com/in/yourname"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">GitHub / Code Link</label>
                    <input 
                      type="url" 
                      [(ngModel)]="formData.socialLinks.github" 
                      name="github" 
                      placeholder="https://github.com/yourhandle"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Personal Portfolio / Website</label>
                    <input 
                      type="url" 
                      [(ngModel)]="formData.socialLinks.portfolio" 
                      name="portfolio" 
                      placeholder="https://yourportfolio.site"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
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

              <!-- Submit Button -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="submit" 
                  class="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition transform active:scale-98"
                >
                  🚀 Publish Store & Start Receiving Gigs
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
                  Mentioning your local area (e.g. Indiranagar, Sector 18) and adding Instagram/LinkedIn handles builds 3x more trust with neighbors.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class CreateStoreComponent {
  storeService = inject(StoreService);
  private router = inject(Router);

  availableCategories = [
    'Video & Editing',
    'Web & Tech',
    'Photography',
    'Tutoring & Education',
    'Graphics & Design',
    'Tech Support & Hardware'
  ];

  skillsInput = 'Short Reels, Adobe Premiere, Color Grading';

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
    socialLinks: {
      instagram: 'https://instagram.com/myreels',
      linkedin: 'https://linkedin.com/in/myprofile',
      github: '',
      portfolio: 'https://myportfolio.site'
    },
    description: 'Specializing in fast video editing for neighborhood businesses, gyms, restaurants, and personal brands. Available for direct meetups and quick shoots.'
  };

  onSubmit(): void {
    const skills = this.skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const initialServices: StoreServiceItem[] = [
      {
        id: 's-initial-1',
        name: 'Single 30-60s Reel / Short Edit',
        price: this.formData.startingPrice,
        duration: '24 hours',
        description: 'Complete cut with dynamic subtitles, audio mixing, and color grade.'
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
      socialLinks: this.formData.socialLinks,
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

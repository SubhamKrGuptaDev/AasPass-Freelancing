import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { StoreProfile, StoreServiceItem } from '../../models/store.model';

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50/70 pb-24">
      
      @if (store(); as s) {
        
        <!-- Header Banner -->
        <div class="h-44 sm:h-56 bg-gradient-to-r {{ s.bannerGradient }} relative">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end">
            <!-- Back Button -->
            <a 
              routerLink="/" 
              class="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white text-xs font-semibold backdrop-blur-md transition"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Back to Directory</span>
            </a>
          </div>
        </div>

        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Left 2 Cols: Main Store Info & Services -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- Store Profile Card -->
              <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative">
                
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div class="flex items-center gap-4">
                    <img 
                      [src]="s.avatarUrl" 
                      [alt]="s.ownerName" 
                      class="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md flex-shrink-0"
                    />
                    <div>
                      <div class="flex items-center gap-2">
                        <h1 class="text-2xl font-black text-slate-900">{{ s.storeName }}</h1>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          VERIFIED
                        </span>
                      </div>
                      <p class="text-sm font-medium text-slate-500">
                        Managed by <span class="text-slate-800 font-semibold">{{ s.ownerName }}</span> • {{ s.experienceYears }} years experience
                      </p>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Available in {{ s.area }}, {{ s.city }}
                        </span>
                        <span class="text-xs text-slate-400">•</span>
                        <span class="text-xs font-medium text-slate-600">
                          📍 {{ s.distanceKm }} km away (Serves up to {{ s.serviceRadiusKm }} km)
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Edit store shortcut if this is user's store -->
                  @if (isOwner()) {
                    <a 
                      routerLink="/create-store" 
                      class="px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
                    >
                      ✏️ Edit My Store
                    </a>
                  }
                </div>

                <!-- Tagline -->
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
                  <p class="text-sm font-semibold text-slate-800">
                    "{{ s.tagline }}"
                  </p>
                </div>

                <!-- Description / Bio -->
                <div class="mb-6">
                  <h3 class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">About the Store & Freelancer</h3>
                  <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {{ s.description }}
                  </p>
                </div>

                <!-- Skills -->
                <div>
                  <h3 class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Core Skills & Tools</h3>
                  <div class="flex flex-wrap gap-2">
                    @for (skill of s.skills; track skill) {
                      <span class="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold">
                        {{ skill }}
                      </span>
                    }
                  </div>
                </div>

              </div>

              <!-- Available Gigs & Services List -->
              <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <h2 class="text-lg font-bold text-slate-900">Services & Gig Packages</h2>
                    <p class="text-xs text-slate-500">Standard rates for direct neighborhood bookings</p>
                  </div>
                  <span class="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    {{ s.services.length }} Available Packages
                  </span>
                </div>

                <div class="space-y-4">
                  @for (srv of s.services; track srv.id) {
                    <div class="p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                            {{ srv.name }}
                          </h4>
                          @if (srv.duration) {
                            <span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              ⏱️ {{ srv.duration }}
                            </span>
                          }
                        </div>
                        <p class="text-xs text-slate-600">{{ srv.description }}</p>
                      </div>

                      <div class="flex items-center gap-4 sm:flex-col sm:items-end w-full sm:w-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <div class="text-right">
                          <span class="text-base sm:text-lg font-black text-indigo-700">₹{{ srv.price }}</span>
                        </div>
                        <button 
                          type="button" 
                          (click)="selectService(srv)"
                          class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
                        >
                          Book Service
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Store Owner Ratings & Customer Reviews Section -->
              <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
                  <div>
                    <div class="flex items-center gap-2">
                      <h2 class="text-lg font-bold text-slate-900">Store Owner Reviews & Ratings</h2>
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        1.0 - 5.0 RATING
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">Verified feedback from neighborhood clients</p>
                  </div>

                  <!-- Average Rating Display -->
                  <div class="flex items-center gap-3 bg-amber-50/80 px-4 py-2 rounded-2xl border border-amber-200">
                    <span class="text-amber-500 text-xl">⭐</span>
                    <div>
                      <div class="flex items-baseline gap-1">
                        <span class="text-xl font-black text-amber-950">{{ s.rating | number:'1.1-1' }}</span>
                        <span class="text-xs font-semibold text-slate-400">/ 5.0</span>
                      </div>
                      <span class="text-[10px] font-semibold text-slate-500 block">
                        {{ (s.reviews?.length || s.reviewCount) }} Client Reviews
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Review Form or Store Owner Notice -->
                @if (isOwner()) {
                  <div class="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 mb-6 flex items-start gap-3">
                    <span class="text-xl">👑</span>
                    <div>
                      <h4 class="text-xs font-bold text-indigo-950">Store Owner Dashboard View</h4>
                      <p class="text-xs text-indigo-800 leading-relaxed mt-0.5">
                        You are the owner of this store. Customer ratings (min 1.0 to max 5.0) and messages left by clients appear below.
                      </p>
                    </div>
                  </div>
                } @else {
                  <!-- Client Review Submission Form -->
                  <div class="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 mb-6">
                    <div class="flex items-center justify-between mb-4">
                      <h3 class="text-xs uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5">
                        <span>✍️ Leave a Review for {{ s.ownerName }}</span>
                      </h3>
                      <span class="text-[10px] font-semibold text-slate-400">Scale: 1.0 (min) to 5.0 (max)</span>
                    </div>

                    <div class="space-y-4">
                      <!-- Row 1: Review User Name & Rating Selector -->
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">
                            Review User Name *
                          </label>
                          <input 
                            type="text" 
                            [(ngModel)]="reviewUserName" 
                            placeholder="Your Name (e.g. Rahul Verma)"
                            class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">
                            Rating: <span class="text-amber-600 font-extrabold text-sm">{{ reviewRating | number:'1.1-1' }} ⭐</span>
                            <span class="text-[10px] font-normal text-slate-400 ml-1">(Min 1.0, Max 5.0)</span>
                          </label>
                          <div class="flex items-center gap-1">
                            @for (star of [1, 2, 3, 4, 5]; track star) {
                              <button 
                                type="button" 
                                (click)="setRating(star)"
                                class="p-1 rounded-lg hover:scale-125 transition text-base cursor-pointer"
                                [title]="'Set ' + star + '.0 rating'"
                              >
                                {{ star <= reviewRating ? '⭐' : '☆' }}
                              </button>
                            }
                            <!-- Number stepper input with strict min 1.0 and max 5.0 -->
                            <div class="flex items-center gap-1 ml-auto">
                              <input 
                                type="number" 
                                min="1.0" 
                                max="5.0" 
                                step="0.1" 
                                [(ngModel)]="reviewRating" 
                                (ngModelChange)="setRating($event)"
                                class="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                              />
                              <span class="text-xs text-slate-400 font-semibold">/ 5.0</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Row 2: Message -->
                      <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">
                          Review Message *
                        </label>
                        <textarea 
                          [(ngModel)]="reviewMessage" 
                          rows="3" 
                          placeholder="Share details about the work done, punctuality, communication, or service quality..."
                          class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        ></textarea>
                      </div>

                      <!-- Validation error alert -->
                      @if (reviewError) {
                        <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                          <span>⚠️</span>
                          <span>{{ reviewError }}</span>
                        </div>
                      }

                      <div class="flex items-center justify-between pt-1">
                        <span class="text-[11px] text-slate-400">
                          Ratings directly update {{ s.ownerName }}'s neighborhood profile.
                        </span>
                        <button 
                          type="button" 
                          (click)="submitReview()"
                          class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs hover:shadow-md transition active:scale-98 cursor-pointer"
                        >
                          Submit Review
                        </button>
                      </div>
                    </div>
                  </div>
                }

                <!-- Customer Reviews List -->
                <div class="space-y-3">
                  <h3 class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">
                    Recent Customer Ratings & Feedback
                  </h3>

                  @if (s.reviews && s.reviews.length > 0) {
                    @for (rev of s.reviews; track rev.id) {
                      <div class="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-200 transition-all shadow-2xs">
                        <div class="flex items-start justify-between gap-3 mb-2">
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                              {{ rev.userName.slice(0, 2).toUpperCase() }}
                            </div>
                            <div>
                              <div class="flex items-center gap-2">
                                <h4 class="text-sm font-bold text-slate-900">{{ rev.userName }}</h4>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ✓ Verified Client
                                </span>
                              </div>
                              <span class="text-[11px] text-slate-400 font-medium">{{ rev.date }}</span>
                            </div>
                          </div>

                          <!-- Rating Score Badge (1.0 to 5.0) -->
                          <div class="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black">
                            <span>⭐</span>
                            <span>{{ rev.rating | number:'1.1-1' }}</span>
                            <span class="text-[10px] text-amber-600 font-normal">/ 5.0</span>
                          </div>
                        </div>

                        <!-- Message -->
                        <div class="pl-13 text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          "{{ rev.message }}"
                        </div>
                      </div>
                    }
                  } @else {
                    <div class="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/80">
                      <span class="text-2xl mb-1 block">💬</span>
                      <h4 class="text-xs font-bold text-slate-800">No customer reviews yet</h4>
                      <p class="text-[11px] text-slate-500 mt-1">Be the first client to book and review {{ s.ownerName }}'s store!</p>
                    </div>
                  }
                </div>

              </div>

            </div>

            <!-- Right 1 Col: Rates & Direct Contact Card -->
            <div class="space-y-6">
              
              <!-- Quick Booking / Rate Card -->
              <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs sticky top-24">
                
                <div class="pb-5 border-b border-slate-100 mb-5">
                  <div class="flex items-baseline justify-between mb-1">
                    <span class="text-xs text-slate-500 font-semibold">Standard Hourly Rate</span>
                    <div>
                      <span class="text-2xl font-black text-slate-900">₹{{ s.hourlyRate }}</span>
                      <span class="text-xs text-slate-500">/hr</span>
                    </div>
                  </div>
                  <p class="text-[11px] text-slate-400">Services start from ₹{{ s.startingPrice }}</p>
                </div>

                <!-- Neighborhood Advantage Pill -->
                <div class="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 mb-5">
                  <div class="flex items-start gap-2.5">
                    <span class="text-lg">📍</span>
                    <div>
                      <h4 class="text-xs font-bold text-indigo-950">Hyperlocal Advantage</h4>
                      <p class="text-[11px] text-indigo-800 leading-relaxed mt-0.5">
                        {{ s.ownerName }} is located just <strong>{{ s.distanceKm }} km away</strong> in {{ s.area }}. Ideal for fast turnaround or in-person work meetings.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Connect / Inquire Actions -->
                <div class="space-y-3 mb-6">
                  <button 
                    type="button" 
                    (click)="triggerInquiry()"
                    class="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition transform active:scale-98 flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <span>Message / Send Request</span>
                  </button>

                  <button 
                    type="button" 
                    (click)="triggerCall()"
                    class="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-2"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span>Request Phone Callback</span>
                  </button>
                </div>

                <!-- Social Media Accounts (As requested: Instagram, LinkedIn, GitHub, etc.) -->
                <div class="pt-5 border-t border-slate-100">
                  <h4 class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">Verified Socials & Portfolio</h4>
                  <div class="flex flex-col gap-2">
                    @if (s.socialLinks.instagram) {
                      <a [href]="s.socialLinks.instagram" target="_blank" class="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-pink-600 transition p-2 rounded-xl bg-slate-50 hover:bg-pink-50">
                        <span>📸 Instagram</span>
                        <span class="text-[10px] text-slate-400 ml-auto">View Feed →</span>
                      </a>
                    }
                    @if (s.socialLinks.linkedin) {
                      <a [href]="s.socialLinks.linkedin" target="_blank" class="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition p-2 rounded-xl bg-slate-50 hover:bg-blue-50">
                        <span>💼 LinkedIn</span>
                        <span class="text-[10px] text-slate-400 ml-auto">Connect →</span>
                      </a>
                    }
                    @if (s.socialLinks.github) {
                      <a [href]="s.socialLinks.github" target="_blank" class="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition p-2 rounded-xl bg-slate-50 hover:bg-slate-100">
                        <span>💻 GitHub</span>
                        <span class="text-[10px] text-slate-400 ml-auto">Code →</span>
                      </a>
                    }
                    @if (s.socialLinks.portfolio) {
                      <a [href]="s.socialLinks.portfolio" target="_blank" class="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition p-2 rounded-xl bg-slate-50 hover:bg-indigo-50">
                        <span>🌐 Portfolio Website</span>
                        <span class="text-[10px] text-slate-400 ml-auto">Visit →</span>
                      </a>
                    }
                    @if (s.socialLinks.youtube) {
                      <a [href]="s.socialLinks.youtube" target="_blank" class="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-red-600 transition p-2 rounded-xl bg-slate-50 hover:bg-red-50">
                        <span>🎥 YouTube Channel</span>
                        <span class="text-[10px] text-slate-400 ml-auto">Watch →</span>
                      </a>
                    }
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      } @else {
        <div class="max-w-md mx-auto text-center py-20">
          <h2 class="text-lg font-bold text-slate-800">Store Not Found</h2>
          <a routerLink="/" class="text-xs text-indigo-600 font-semibold mt-2 inline-block">Return to home</a>
        </div>
      }

      <!-- Interactive Inquiry Toast Notification -->
      @if (notificationMessage) {
        <div class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <span class="text-emerald-400 text-lg">✓</span>
          <span class="text-xs font-semibold">{{ notificationMessage }}</span>
        </div>
      }

    </div>
  `
})
export class StoreDetailComponent {
  private route = inject(ActivatedRoute);
  storeService = inject(StoreService);

  notificationMessage: string | null = null;

  // Review Form state
  reviewUserName: string = this.storeService.currentUser().name;
  reviewRating: number = 5.0;
  reviewMessage: string = '';
  reviewError: string | null = null;

  store = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? this.storeService.getStoreById(id) : undefined;
  });

  isOwner = computed(() => {
    const s = this.store();
    return s && s.userId === this.storeService.currentUser().id;
  });

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
